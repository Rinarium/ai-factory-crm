# Tasks

<!-- Plan written by superpowers:writing-plans. See design.md for the approach. -->

Spec: `proposal.md`, `design.md` and the delta specs in `specs/`. The pattern to copy end to end is the dashboard: `services/backend/src/dashboard.ts`, `src/db/user-stats.ts`, `src/graphql/resources/dashboard.ts`, `services/ui/src/pages/dashboard/`, `services/ui/src/hooks/useDashboard.ts` and `services/e2e/tests/dashboard.spec.ts`. Commit subjects are `[1][fafc34] <scope>: <Description>`.

Global constraints (from the specs): the query is `contacts`, returning `[Contact!]!` with `id`, `name` and `email`; the signed-out error is `UNAUTHENTICATED`; the copy is exactly "Contacts", "No contacts yet.", "Couldn't load the contacts." and the existing Reload button; the navigation link is "Contacts" to `/contacts`.

Review focus (pinned by a test in the task that owns the code): two contacts created in the same instant keep a stable order (task 1); a malformed `contacts` answer shows the failed notice, not a crash (task 2); the "Contacts" link is current on `/contacts` and "Dashboard" is not (task 2).

## 1. Contacts in the backend

Interfaces. Produces: `Contact = { id: string; name: string; email: string }` and `ContactsSource = { list: () => Promise<Contact[]> }` in `src/contacts.ts`; `databaseContacts(db: AnyDatabase): ContactsSource` in `src/db/contacts.ts`; `contacts` on `Context` and on the `createApp` dependencies.

- [x] 1.1 [backend] Write the failing integration test `tests/integration/contacts.test.ts`: `[contacts-eee491]` inserts three contacts with different `createdAt` (and two sharing one instant) through the test database, sends `{ contacts { id name email } }` signed in, and expects newest first with the shared-instant pair in a stable `id` order; a second case expects `[]` on an empty table; `[contacts-4e5717]` expects `{ data: null, errors: [{ extensions: { code: "UNAUTHENTICATED" } }] }` for no cookie and for a forged cookie, as `dashboard.test.ts` does. Run `bin/check backend` scripts `test:integration` and see them fail.
- [x] 1.2 [backend] Add the table in `src/db/schema/contacts.ts` (`pgTable("contacts", { id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull(), ...timestamps })`), export it from `src/db/schema/index.ts`, and generate the migration and snapshot as AGENTS.md → database says (`db:generate`); commit the generated folder.
- [x] 1.3 [backend] Add `src/contacts.ts` (the `Contact` and `ContactsSource` types and a comment saying it is the port the resolver reads through), `src/db/contacts.ts` (`databaseContacts`: select `id`, `name`, `email` ordered by `createdAt` descending then `id`), and `src/graphql/resources/contacts.ts` (a `Contact` object type and a `contacts` query field, `[Contact!]!`, that calls `viewerRequired(context)` first and returns `context.contacts.list()`); import the resource in `src/graphql/schema.ts`.
- [x] 1.4 [backend] Wire the source: add `contacts: ContactsSource` to `Context` in `src/graphql/builder.ts` and to the `createApp` dependencies in `src/app.ts`, pass `databaseContacts(db)` in `src/server.ts` and `tests/support/server.ts`, and add `contacts` to `base` in `tests/unit/viewer-required.test.ts`.
- [x] 1.5 [backend] Cover `databaseContacts` and the resolver's unit paths so lines and functions stay at 100%: add `tests/unit/contacts.test.ts` if a branch is not reached by the integration test.
- [x] 1.6 [repo] Run `bin/contracts generate`; the backend's `contracts/schema.graphql` gains `Contact` and `contacts`, and the UI's generated types stay unchanged until task 2 adds a document.
- [x] 1.7 [backend] Run `bin/check backend`; every gate passes, including the naming rule (`contacts` names `[Contact!]!`). Then commit: `[1][fafc34] backend: List contacts, newest first`.

## 2. The contacts page in the UI

Interfaces. Consumes: the backend contract from task 1. Produces: `ContactsQuery` (operation name `Contacts`) in `src/services/graphql/contacts.ts`; `useContacts(): ContactsState` in `src/hooks/useContacts.ts`, shaped like `DashboardState` (`loading`, `failed`, or `ready` with `contacts: { id: string; name: string; email: string }[]`); `ContactsPage` in `src/pages/contacts/ContactsPage.tsx`.

- [ ] 2.1 [ui] Write the failing tests, from the scenarios and in the style of `tests/unit/hooks/useDashboard.test.tsx`, `tests/unit/pages/dashboard/` and `tests/integration/routes.test.tsx`, with a `tests/support/contacts.ts` answer helper like `tests/support/dashboard.ts`: `useContacts` is loading, ready, failed on a network error, failed on a malformed answer and failed when the API is not configured; `[contacts-9349cb]` the page shows the "Contacts" heading and each contact's name and email in the answer's order; `[contacts-da3cf2]` an empty answer shows "No contacts yet." and no list rows; `[contacts-d8060b]` a failure shows "Couldn't load the contacts." and a "Reload" button and no list; `[app-shell-8c8fd1]` in `routes.test.tsx`, clicking "Contacts" opens `/contacts`, marks "Contacts" current and not "Dashboard". Run `test:unit` and see them fail.
- [ ] 2.2 [ui] Add `src/services/graphql/contacts.ts` (`ContactsQuery = graphql("query Contacts { contacts { id name email } }")`), then `bin/contracts generate` so the typed documents in `src/services/graphql/generated/` include it.
- [ ] 2.3 [ui] Add `src/hooks/useContacts.ts`: the same shape as `useDashboard`, parsing the answer with a zod schema of `{ contacts: { id, name, email }[] }` so anything else is `failed`.
- [ ] 2.4 [ui] Add `src/pages/contacts/ContactsPage.tsx`: the failed state is a `Notice` with the Reload button, as `DashboardPage`; otherwise an `h1` "Contacts" and either the empty line or a list with one row per contact showing its name and email. Add the copy under `contacts` and `nav.contacts` in `src/i18n/locales/en/common.json` (`title`, `empty`, `failed`, `retry`).
- [ ] 2.5 [ui] Add the `/contacts` route beside the dashboard's index route in `src/app/routes.tsx`, and a `NavLink` to `/contacts` after "Dashboard" in `src/components/AppHeader.tsx`, with the same classes.
- [ ] 2.6 [ui] Run `bin/check ui`; every gate passes. Then commit: `[1][fafc34] ui: Add the contacts page`.

## 3. End-to-end tests and proof

- [ ] 3.1 [e2e] Write `services/e2e/tests/contacts.spec.ts`, in the style of `dashboard.spec.ts`, each title citing its scenario ID: `[contacts-4e5717]` a signed-out `contacts` request is refused (the `graphql` fixture, no cookie); `[contacts-da3cf2]` a signed-in user opens `/contacts` on the real stack and sees "No contacts yet."; `[contacts-9349cb]` the same with `page.route("**/graphql", ...)` fulfilling only the `Contacts` operation with two fixed rows (the other operations `continue()`), expecting both names and emails in order; `[contacts-d8060b]` the `Contacts` operation aborted, expecting the notice and a "Reload" button; `[app-shell-8c8fd1]` clicking "Contacts" in the header opens `/contacts` and marks it current. `[contacts-eee491]` carries its `NO E2E` line already.
- [ ] 3.2 [repo] Bring up the stack (`bin/up`) and run `bin/e2e --changed`, then the full `bin/e2e`; every test passes. Use the page for real in the Orca browser: sign in, open Contacts through the header, and see the empty state.
- [ ] 3.3 [e2e] Capture the proof: `bin/e2e --proof --change 1-fafc34-contacts-list -- --grep "contacts-|app-shell-8c8fd1"` and commit the screenshots it writes to `openspec/changes/1-fafc34-contacts-list/proof/`: `[1][fafc34] e2e: Prove the contacts page`.
- [ ] 3.4 [repo] Run `bin/check-spec-coverage.sh`; no scenario is uncovered. The archive and the pull request are `/work-pr`'s.
