import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const shoppingItems = table("shopping_items", {
  id: t.int({ mode: "number" }).primaryKey({ autoIncrement: true }),
  listItem: t.text("").default("not_provided"),
});

export const schema = {
  shoppingItems,
};


export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type NewShoppingItem = typeof shoppingItems.$inferInsert;