// The Contact resource: a person in the CRM.
import type { Contact } from "../../contacts";
import { builder } from "../builder";
import { viewerRequired } from "../viewer-required";

const ContactType = builder.objectRef<Contact>("Contact").implement({
  description: "A person in the CRM.",
  fields: (t) => ({
    id: t.exposeID("id", { description: "The contact's ID." }),
    name: t.exposeString("name", { description: "The contact's name." }),
    email: t.exposeString("email", { description: "The contact's email." }),
  }),
});

builder.queryField("contacts", (t) =>
  t.field({
    type: [ContactType],
    description:
      "Every contact, the most recently created first. Fails with UNAUTHENTICATED when signed out.",
    resolve: (_root, _args, context) => {
      viewerRequired(context);
      return context.contacts.list();
    },
  }),
);
