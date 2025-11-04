import { eq } from "drizzle-orm";
import express from "express";
import { db } from "../db/index";
import { matchesTable } from "../db/schema";
import { matchesInsertSchema } from "../db/validation-schema";
import type { APIResponse } from "../types";

const router = express.Router();

// GET all matches
router.get("/", async (_req, res) => {
	try {
		const matches = await db.select().from(matchesTable);
		const response: APIResponse<typeof matches> = {
			data: matches,
			message: "Matches fetched successfully",
		};
		res.json(response);
	} catch (error) {
		console.error("Error fetching matches:", error);
		res.status(500).json({ error: "Failed to fetch matches" });
	}
});

// GET single match by id
router.get("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid ID" });
		}

		const match = await db
			.select()
			.from(matchesTable)
			.where(eq(matchesTable.id, id))
			.limit(1);

		if (match.length === 0) {
			return res.status(404).json({ error: "Match not found" });
		}

		const response: APIResponse<(typeof match)[0]> = {
			data: match[0]!,
			message: "Match fetched successfully",
		};
		res.json(response);
	} catch (error) {
		console.error("Error fetching match:", error);
		res.status(500).json({ error: "Failed to fetch match" });
	}
});

// POST create new match
router.post("/", async (req, res) => {
	try {
		const validatedData = matchesInsertSchema.parse(req.body);
		const newMatch = await db
			.insert(matchesTable)
			.values(validatedData)
			.returning();

		const response: APIResponse<(typeof newMatch)[0]> = {
			data: newMatch[0]!,
			message: "Match created successfully",
		};
		res.status(201).json(response);
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error });
		}
		res.status(500).json({ error: "Failed to create match" });
	}
});

// PUT update match by id
router.put("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid ID" });
		}

		// Validate the request body
		const validatedData = matchesInsertSchema.partial().parse(req.body);

		// Update the updatedAt timestamp
		const updateData = {
			...validatedData,
			updatedAt: new Date(),
		};

		const updatedMatch = await db
			.update(matchesTable)
			.set(updateData)
			.where(eq(matchesTable.id, id))
			.returning();

		if (updatedMatch.length === 0) {
			return res.status(404).json({ error: "Match not found" });
		}

		const response: APIResponse<(typeof updatedMatch)[0]> = {
			data: updatedMatch[0]!,
			message: "Match updated successfully",
		};
		res.json(response);
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return res
				.status(400)
				.json({ error: "Validation failed", details: error });
		}
		res.status(500).json({ error: "Failed to update match" });
	}
});

// DELETE match by id
router.delete("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid ID" });
		}

		const deletedMatch = await db
			.delete(matchesTable)
			.where(eq(matchesTable.id, id))
			.returning();

		if (deletedMatch.length === 0) {
			return res.status(404).json({ error: "Match not found" });
		}

		const response: APIResponse<(typeof deletedMatch)[0]> = {
			data: deletedMatch[0]!,
			message: "Match deleted successfully",
		};
		res.json(response);
	} catch (error) {
		console.error("Error deleting match:", error);
		res.status(500).json({ error: "Failed to delete match" });
	}
});

export default router;
