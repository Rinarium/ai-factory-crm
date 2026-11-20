# Spec Delta

## Purpose

The people in the CRM: the query that lists every contact and the screen that shows them, with what a signed-out client, an empty list and a failed load look like.

## ADDED Requirements

### Requirement: The contacts query lists every contact, newest first
The API's `contacts` query SHALL answer a signed-in request with every contact's `id`, `name` and `email`, the most recently created first, and an empty list when there are none.

#### Scenario: [contacts-eee491] A signed-in request reads the contacts newest first
- **WHEN** a signed-in client sends `{ contacts { id name email } }` while contacts created at different times exist
- **THEN** it gets every contact, ordered from the most recently created to the oldest
- **NO E2E** internal-rule: services/backend/tests/integration/contacts.test.ts

### Requirement: Only a signed-in user reads the contacts
The API SHALL refuse the `contacts` query to a request without a valid session with a GraphQL error whose `extensions.code` is `UNAUTHENTICATED`, and no contacts.

#### Scenario: [contacts-4e5717] A signed-out request is refused
- **WHEN** a client without a valid session sends the `contacts` query
- **THEN** the answer has `data: null` and an error with `extensions.code` `UNAUTHENTICATED`

### Requirement: The contacts page lists each contact
The UI SHALL show a signed-in user, at `/contacts`, a "Contacts" heading and a list with each contact's name and email, in the order the `contacts` query answers.

#### Scenario: [contacts-9349cb] The page lists the contacts
- **WHEN** a signed-in user opens `/contacts` and the `contacts` query answers two contacts
- **THEN** the page shows the "Contacts" heading and, in the answer's order, each contact's name and email

### Requirement: An empty contacts list says so
The UI SHALL show "No contacts yet." on the contacts page when the `contacts` query answers no contacts.

#### Scenario: [contacts-da3cf2] A stack with no contacts shows the empty state
- **WHEN** a signed-in user opens `/contacts` and no contact exists
- **THEN** the page shows the "Contacts" heading and "No contacts yet.", and no list rows

### Requirement: A contacts page that fails to load says so
The UI SHALL replace the list, when the `contacts` query fails or answers something else, with a "Couldn't load the contacts." notice that offers to reload.

#### Scenario: [contacts-d8060b] A failed load shows the notice
- **WHEN** the `contacts` request fails or its answer is malformed
- **THEN** the page shows "Couldn't load the contacts." and a Reload button, and no list
