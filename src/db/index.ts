import { drizzle } from "drizzle-orm/postgres-js";
import "dotenv/config";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
