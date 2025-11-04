import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	age: integer().notNull(),
	email: text().notNull().unique(),
});

export const matchesTable = pgTable("matches", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	provider: text().notNull(),
	subject: text().notNull(),
	body: text().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});
