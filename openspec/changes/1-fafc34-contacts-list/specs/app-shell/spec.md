# Spec Delta

## ADDED Requirements

### Requirement: The navigation links to the contacts list
The UI's header navigation SHALL include a "Contacts" link to `/contacts`, marked as the current page while `/contacts` is open.

#### Scenario: [app-shell-8c8fd1] The Contacts link opens the contacts page
- **WHEN** a signed-in user clicks the "Contacts" link in the header
- **THEN** the page opens `/contacts` and the "Contacts" link is marked as the current page, and "Dashboard" is not
