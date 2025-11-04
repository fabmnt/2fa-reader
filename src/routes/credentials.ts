import { eq } from "drizzle-orm";
import express from "express";
import { db } from "../db/index";
import { credentialsTable } from "../db/schema";
import { credentialsInsertSchema } from "../db/validation-schema";
import type { APIResponse } from "../types";

const router = express.Router();

// GET all credentials
router.get("/", async (_req, res) => {
	try {
		const credentials = await db.select().from(credentialsTable);
		const response: APIResponse<typeof credentials> = {
			data: credentials,
			message: "Credentials fetched successfully",
		};
		res.json(response);
	} catch (error) {
		console.error("Error fetching credentials:", error);
		res.status(500).json({ error: "Failed to fetch credentials" });
	}
});

// GET single credential by id
router.get("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid ID" });
		}

		const credential = await db
			.select()
			.from(credentialsTable)
			.where(eq(credentialsTable.id, id))
			.limit(1);

		if (credential.length === 0) {
			return res.status(404).json({ error: "Credential not found" });
		}

		const response: APIResponse<(typeof credential)[0]> = {
			data: credential[0]!,
			message: "Credential fetched successfully",
		};
		res.json(response);
	} catch (error) {
		console.error("Error fetching credential:", error);
		res.status(500).json({ error: "Failed to fetch credential" });
	}
});

// POST create new credential
router.post("/", async (req, res) => {
	try {
		const { success, data, error } = credentialsInsertSchema.safeParse(
			req.body,
		);

		if (!success) {
			return res.status(400).json({
				error: "Validation failed",
				details: error.issues.map((issue) => ({
					field: issue.path.join("."),
					message: issue.message,
				})),
			});
		}

		const [newCredential] = await db
			.insert(credentialsTable)
			.values(data)
			.returning();

		if (!newCredential) {
			return res.status(500).json({ error: "Failed to create credential" });
		}

		const response: APIResponse<typeof newCredential> = {
			data: newCredential,
			message: "Credential created successfully",
		};

		res.status(201).json(response);
	} catch (_) {
		res.status(500).json({ error: "Failed to create credential" });
	}
});

// PUT update credential by id
router.put("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid ID" });
		}

		// Validate the request body
		const { success, data, error } = credentialsInsertSchema
			.omit({ createdAt: true, updatedAt: true })
			.partial()
			.safeParse(req.body);

		if (!success) {
			return res.status(400).json({
				error: "Validation failed",
				details: error.issues.map((issue) => ({
					field: issue.path.join("."),
					message: issue.message,
				})),
			});
		}

		// Update the updatedAt timestamp
		const updateData = {
			...data,
			updatedAt: new Date(),
		};

		const [updatedCredential] = await db
			.update(credentialsTable)
			.set(updateData)
			.where(eq(credentialsTable.id, id))
			.returning();

		if (!updatedCredential) {
			return res.status(404).json({ error: "Credential not found" });
		}

		const response: APIResponse<typeof updatedCredential> = {
			data: updatedCredential,
			message: "Credential updated successfully",
		};
		res.json(response);
	} catch (_) {
		const response: APIResponse = {
			error: "Failed to update credential",
		};
		res.status(500).json(response);
	}
});

// DELETE credential by id
router.delete("/:id", async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid ID" });
		}

		const [deletedCredential] = await db
			.delete(credentialsTable)
			.where(eq(credentialsTable.id, id))
			.returning();

		if (!deletedCredential) {
			return res.status(404).json({ error: "Credential not found" });
		}

		const response: APIResponse<typeof deletedCredential> = {
			data: deletedCredential,
			message: "Credential deleted successfully",
		};
		res.json(response);
	} catch (_) {
		const response: APIResponse = {
			error: "Failed to delete credential",
		};
		res.status(500).json(response);
	}
});

export default router;
