import { afterEach, expect, test } from "bun:test";
import { z } from "zod";
import { contacts } from "../../src/db/schema";
import { appServers, graphql, signedInCookie } from "../support/server";

const apps = appServers();
afterEach(apps.close);

const CONTACTS = "{ contacts { id name email } }";

const contactsAnswer = z.object({
  data: z.object({
    contacts: z.array(
      z.object({ id: z.string(), name: z.string(), email: z.string() }),
    ),
  }),
});

// The answer to a signed-out request: no data, one UNAUTHENTICATED error.
const unauthenticated = {
  data: null,
  errors: [
    {
      message: "Sign in to see this.",
      extensions: { code: "UNAUTHENTICATED" },
    },
  ],
};

function contact(id: string, createdAt: string): typeof contacts.$inferInsert {
  return {
    id,
    name: `Name ${id}`,
    email: `${id}@example.com`,
    createdAt: new Date(createdAt),
  };
}

test("[contacts-eee491] a signed-in request reads the contacts newest first", async () => {
  const { base, db } = await apps.startSeededWithDatabase();
  // c-a and c-b share one instant: their order must not depend on the engine.
  await db
    .insert(contacts)
    .values([
      contact("c-old", "2026-01-01T09:00:00Z"),
      contact("c-b", "2026-03-01T09:00:00Z"),
      contact("c-new", "2026-05-01T09:00:00Z"),
      contact("c-a", "2026-03-01T09:00:00Z"),
    ]);
  const answer = contactsAnswer.parse(
    await graphql(base, CONTACTS, await signedInCookie(base)),
  );
  expect(answer.data.contacts).toEqual([
    { id: "c-new", name: "Name c-new", email: "c-new@example.com" },
    { id: "c-a", name: "Name c-a", email: "c-a@example.com" },
    { id: "c-b", name: "Name c-b", email: "c-b@example.com" },
    { id: "c-old", name: "Name c-old", email: "c-old@example.com" },
  ]);
});

test("a signed-in request with no contacts reads an empty list", async () => {
  const base = await apps.startSeeded();
  expect(await graphql(base, CONTACTS, await signedInCookie(base))).toEqual({
    data: { contacts: [] },
  });
});

test.each([undefined, "better-auth.session_token=forged"])(
  "[contacts-4e5717] a signed-out request is refused: %p",
  async (cookie) => {
    const base = await apps.startSeeded();
    expect(await graphql(base, CONTACTS, cookie)).toMatchObject(
      unauthenticated,
    );
  },
);
