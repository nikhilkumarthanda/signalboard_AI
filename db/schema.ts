import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const scenarios = sqliteTable("scenarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  churn: real("churn").notNull(),
  hires: integer("hires").notNull(),
  arr: real("arr").notNull(),
  margin: real("margin").notNull(),
  runway: real("runway").notNull(),
  createdAt: text("created_at").notNull(),
});

export const alertStates = sqliteTable("alert_states", {
  alertId: integer("alert_id").notNull(),
  ownerEmail: text("owner_email").notNull(),
  status: text("status", { enum: ["open", "acknowledged", "resolved", "dismissed"] }).notNull(),
  assignee: text("assignee"),
  note: text("note"),
  updatedAt: text("updated_at").notNull(),
});

export const imports = sqliteTable("imports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  fileName: text("file_name").notNull(),
  rowCount: integer("row_count").notNull(),
  validRows: integer("valid_rows").notNull(),
  totalMrr: real("total_mrr").notNull(),
  importedAt: text("imported_at").notNull(),
});
