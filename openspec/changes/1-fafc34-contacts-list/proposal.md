# Proposal

**Issue:** #1
**Type:** feature
**Services:** backend, ui, e2e

## Why

The CRM has no people in it yet, and everything else in the backlog (companies, deals, notes) hangs off contacts. The app first needs somewhere to keep and show them.

## What Changes

- A `contacts` table with a name, an email and the shared timestamps, and a migration for it.
- A `contacts` GraphQL query that returns every contact, newest first, to a signed-in user only; a signed-out request is refused with `UNAUTHENTICATED`.
- A "Contacts" link in the navigation and a `/contacts` page that lists each contact's name and email, says "No contacts yet." when there are none, and shows a notice with a reload button when the load fails.
- The regenerated contract `services/backend/contracts/schema.graphql`.
- End-to-end tests for every new scenario.

## Capabilities

### New Capabilities
- `contacts`: the contacts list: the `contacts` query and its access rule, and the `/contacts` page with its empty and failed states.

### Modified Capabilities
- `app-shell`: the navigation gains a "Contacts" link.

## Impact

- `services/backend`: `src/db/schema/contacts.ts`, a migration, `src/graphql/resources/contacts.ts`, the regenerated contract, unit and integration tests.
- `services/ui`: the `/contacts` route and page, a `useContacts` hook, `services/graphql/contacts.ts`, the header's navigation, English copy, regenerated GraphQL types.
- `services/e2e`: tests citing the new scenario IDs.
- No new dependencies. `bin/seed` is unchanged.
