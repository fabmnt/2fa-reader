import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type * as z from "zod";
import { credentialsTable, matchesTable } from "./schema";

export const matchesSelectSchema = createSelectSchema(matchesTable);
export const matchesInsertSchema = createInsertSchema(matchesTable);
export const credentialsSelectSchema = createSelectSchema(credentialsTable);
export const credentialsInsertSchema = createInsertSchema(credentialsTable);

export type CredentialsSelect = z.infer<typeof credentialsSelectSchema>;
export type CredentialsInsert = z.infer<typeof credentialsInsertSchema>;
export type MatchesSelect = z.infer<typeof matchesSelectSchema>;
export type MatchesInsert = z.infer<typeof matchesInsertSchema>;
