import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

// A person in the CRM. Several contacts may share an email: whether to refuse
// a duplicate is for the issue that adds contacts.
export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  ...timestamps,
});
