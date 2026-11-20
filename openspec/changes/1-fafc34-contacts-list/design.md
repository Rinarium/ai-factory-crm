# Design

## Context

The CRM has no people in it yet (issue #1). The dashboard is the example every
new feature copies: a Drizzle table, a Pothos resource guarded by
`viewerRequired`, the committed contract `contracts/schema.graphql`, a UI page
behind `RequireSession`, and end-to-end tests that cite scenario IDs. The
`contacts` capability has no spec and no code yet, so there is no baseline to
record. The header's navigation holds one link, "Dashboard".

## Goals / Non-Goals

**Goals:**
- A `contacts` table, and a `contacts` query that returns every contact, newest
  first, to a signed-in user only.
- A "Contacts" navigation link and a `/contacts` page listing each contact's
  name and email, or "No contacts yet." when there are none.

**Non-Goals:**
- Adding, editing, deleting, sorting, searching or paging contacts: later
  issues. The list returns every contact.
- Seeding demo contacts: `bin/seed` stays as it is.
- Linking contacts to companies or deals.

## Approaches

1. Follow the dashboard's pattern: table, resource, contract, page. Chosen.
2. A REST endpoint beside GraphQL: rejected, the backend's only contract is the
   GraphQL schema.
3. A shared data-access layer before the first table: rejected, nothing else
   needs it yet; extract it when a second resource repeats the code.

## Decisions

- **Table `contacts`**: `id` (text, a random UUID), `name` and `email` (both
  not null), and the shared `timestamps` (`created_at`, `updated_at`). `email`
  has no unique constraint: duplicate rules belong to the "add a contact" issue.
- **Query `contacts`**: `[Contact!]!`, ordered by `created_at` descending with
  `id` as the tie-break so the order is stable. `Contact` exposes `id`, `name`
  and `email`; the created date is the order, not a field, until a screen
  needs it. It calls `viewerRequired` first and fails with `UNAUTHENTICATED`.
- **UI**: a `/contacts` route inside `RootLayout` beside the dashboard's, a
  `useContacts` hook and `services/graphql/contacts.ts` like the dashboard's,
  a "Contacts" `NavLink` marked current on `/contacts`, and the empty state
  "No contacts yet." A failed or malformed load shows a notice with a reload
  button, as the dashboard does. Copy goes in `i18n/locales/en/common.json`.
- **Proof without seed data** (the user's call): the empty state is proved on
  the real, fresh stack. A list with contacts is proved in a UI test that
  answers the `contacts` request with fixed rows, as the dashboard's failed
  load is. Newest-first order is proved by the backend's integration tests on
  a real Postgres.
- **Specs**: a new `contacts` capability for the query and the page, and a
  delta on `app-shell` for the navigation link.

## Risks / Trade-offs

- The list has no limit, so a large table returns everything; accepted until a
  paging issue, and the query-complexity limits do not bound row counts.
- A mocked list in the UI test does not exercise the real query with rows; the
  backend integration test covers that half.
