// The people in the CRM. It is the domain module the `contacts` resolver
// reaches data through; the read it needs is the ContactsSource port, which
// src/db/contacts.ts implements over the contacts table.
export type Contact = {
  id: string;
  name: string;
  email: string;
};

/** The reads the contacts list needs; src/db/contacts.ts implements them. */
export type ContactsSource = {
  /** Every contact, the most recently created first. */
  list: () => Promise<Contact[]>;
};
