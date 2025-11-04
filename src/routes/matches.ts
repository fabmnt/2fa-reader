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

		const [match] = await db
			.select()
			.from(matchesTable)
			.where(eq(matchesTable.id, id))
			.limit(1);

		if (!match) {
			return res.status(404).json({ error: "Match not found" });
		}

		const response: APIResponse<typeof match> = {
			data: match,
			message: "Match fetched successfully",
		};
		res.json(response);
	} catch (_) {
		const response: APIResponse = {
			error: "Failed to fetch match",
		};
		res.status(500).json(response);
	}
});

// POST create new match
router.post("/", async (req, res) => {
	try {
		const { success, data, error } = matchesInsertSchema.safeParse(req.body);
		if (!success) {
			return res.status(400).json({
				error: "Validation failed",
				details: error.issues.map((issue) => issue.message).join(". "),
			});
		}
		const newMatch = await db.insert(matchesTable).values(data).returning();

		if (!newMatch) {
			return res.status(500).json({ error: "Failed to create match" });
		}

		const response: APIResponse<typeof newMatch> = {
			data: newMatch,
			message: "Match created successfully",
		};
		res.status(201).json(response);
	} catch (_) {
		const response: APIResponse = {
			error: "Failed to create match",
		};
		res.status(500).json(response);
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
		const { success, data, error } = matchesInsertSchema
			.partial()
			.safeParse(req.body);

		if (!success) {
			return res.status(400).json({
				error: "Validation failed",
				details: error.issues.map((issue) => issue.message).join(". "),
			});
		}

		// Update the updatedAt timestamp
		const updateData = {
			...data,
			updatedAt: new Date(),
		};

		const [updatedMatch] = await db
			.update(matchesTable)
			.set(updateData)
			.where(eq(matchesTable.id, id))
			.returning();

		if (!updatedMatch) {
			return res.status(404).json({ error: "Match not found" });
		}

		const response: APIResponse<typeof updatedMatch> = {
			data: updatedMatch,
			message: "Match updated successfully",
		};
		res.json(response);
	} catch (_) {
		const response: APIResponse = { error: "Failed to update match" };
		res.status(500).json(response);
	}
});

// DELETE match by id
router.delete("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid ID" });
		}

		const [deletedMatch] = await db
			.delete(matchesTable)
			.where(eq(matchesTable.id, id))
			.returning();

		if (!deletedMatch) {
			return res.status(404).json({ error: "Match not found" });
		}

		const response: APIResponse<typeof deletedMatch> = {
			data: deletedMatch,
			message: "Match deleted successfully",
		};
		res.json(response);
	} catch (_) {
		const response: APIResponse = { error: "Failed to delete match" };
		res.status(500).json(response);
	}
});

export default router;
