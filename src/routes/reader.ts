import { eq } from "drizzle-orm";
import express from "express";
import * as z from "zod";
import { db } from "../db";
import { credentialsTable, matchesTable } from "../db/schema";

const router = express.Router();

// GET /api/reader/:matchId/:credentialId
const readerSchema = z.object({
	matchId: z.number(),
	credentialId: z.number(),
});

router.get("/:matchId/:credentialId", async (req, res) => {
	const { success, data, error } = readerSchema.safeParse(req.params);
	if (!success) {
		return res
			.status(400)
			.json({ error: "Invalid request", details: error.message });
	}

	const { matchId, credentialId } = data;
	const match = await db
		.select()
		.from(matchesTable)
		.where(eq(matchesTable.id, matchId));

	const credential = await db
		.select()
		.from(credentialsTable)
		.where(eq(credentialsTable.id, credentialId));

	res.json({ match, credential });
});

export default router;
