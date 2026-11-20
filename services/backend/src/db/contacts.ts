// The contacts list's read over the contacts table.
import { asc, desc } from "drizzle-orm";
import type { ContactsSource } from "../contacts";
import type { AnyDatabase } from "./connection";
import { contacts } from "./schema";

/** ContactsSource over the database's contacts table. */
export function databaseContacts(db: AnyDatabase): ContactsSource {
  return {
    // The id breaks a tie between contacts created in the same instant.
    list: () =>
      db
        .select({
          id: contacts.id,
          name: contacts.name,
          email: contacts.email,
        })
        .from(contacts)
        .orderBy(desc(contacts.createdAt), asc(contacts.id)),
  };
}
