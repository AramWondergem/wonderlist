import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const shoppingListItems = table("shopping_list_items", {
  id: t.int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  text: t.text().notNull(),
  order: t.real().notNull(),
});

export const schema = {
  shoppingListItems,
};
