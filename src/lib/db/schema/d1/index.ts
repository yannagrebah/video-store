import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";

export const prices = sqliteTable("prices", {
  movieId: integer("movie_id").primaryKey(),
  price: real("price").notNull(),
});

export const discounts = sqliteTable("discounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  discountRate: real("discount_rate").notNull(),
  movieBundles: text("movie_bundles", { mode: "json" })
    .$type<number[][]>()
    .notNull(),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  items: text("items", { mode: "json" })
    .$type<{ movieId: number; quantity: number; unitPrice: number }[]>()
    .notNull(),
  subtotal: real("subtotal").notNull(),
  discountAmount: real("discount_amount").default(0).notNull(),
  discountRate: real("discount_rate").default(0).notNull(),
  total: real("total").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

const schema = {
  prices,
  discounts,
  invoices,
};

export default schema;
