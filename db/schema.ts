import { mysqlTable, serial, varchar, timestamp, text, int } from "drizzle-orm/mysql-core"

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const pages = mysqlTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  redirectUrl: text("redirect_url"),
  redirectTime: int("redirect_time").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
