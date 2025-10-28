import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const shoppingListItems = table("shopping_list_items", {
  id: t.serial('id').primaryKey(),
  text: t.text().notNull(),
  order: t.real().notNull()
});

export const schema = {
  shoppingListItems,
};
