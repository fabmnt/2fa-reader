import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type * as z from "zod";
import { matchesTable } from "./schema";

export const matchesSelectSchema = createSelectSchema(matchesTable);
export const matchesInsertSchema = createInsertSchema(matchesTable);

export type MatchesSelect = z.infer<typeof matchesSelectSchema>;
export type MatchesInsert = z.infer<typeof matchesInsertSchema>;
