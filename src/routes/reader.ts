import { eq } from "drizzle-orm";
import express from "express";
import { chromium } from "playwright";
import UserAgent from "user-agents";
import * as z from "zod";
import { db } from "../db";
import { credentialsTable, matchesTable } from "../db/schema";

const router = express.Router();

// GET /api/reader/:matchId/:credentialId
const readerSchema = z.object({
	matchId: z.coerce.number(),
	credentialId: z.coerce.number(),
});

router.get("/:matchId/:credentialId", async (req, res) => {
	const { success, data, error } = readerSchema.safeParse(req.params);
	if (!success) {
		return res.status(400).json({
			error: "Invalid request",
			details: error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});
	}

	const { matchId, credentialId } = data;
	const [match] = await db
		.select()
		.from(matchesTable)
		.where(eq(matchesTable.id, matchId))
		.limit(1);

	const [credential] = await db
		.select()
		.from(credentialsTable)
		.where(eq(credentialsTable.id, credentialId))
		.limit(1);

	if (!match || !credential) {
		return res.status(404).json({
			error: "Match or credential not found",
		});
	}

	console.log(
		`Initializing reader for match ${match.id} and credential ${credential.id}`,
	);
	const args = [
		"--disable-blink-features=AutomationControlled",
		"--no-sandbox",
		"--disable-web-security",
		"--disable-infobars",
		"--disable-extensions",
		"--start-maximized",
		"--window-size=1280,720",
	];

	// instancia del navegador
	const browser = await chromium.launch({ headless: false, args });

	const optionsContext = {
		userAgent: new UserAgent([
			/Chrome/i,
			{ deviceCategory: "desktop" },
		]).toString(),
		locale: "en-US",
		viewport: { width: 1280, height: 720 },
		deviceScaleFactor: 1,
	};
	const context = await browser.newContext(optionsContext);
	const page = await context.newPage();
	await page.goto(
		"https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Faccounts.google.com%2F&dsh=S1243966371%3A1760805593326432&followup=https%3A%2F%2Faccounts.google.com%2F&ifkv=AfYwgwUsYjPKxFSNcYfW-BOE3mK7fsfpCJY2eCfDMsUMvv5TlIKEQFpiBTo22U61SUdMsrVdni-p0A&passive=1209600&flowName=GlifWebSignIn&flowEntry=ServiceLogin",
	);
	const emailInput = await page.waitForSelector("input[type=email]");
	await emailInput.fill(credential.email);
	page.getByText("Next").click();
	const passwordInput = await page.waitForSelector("input[type=password]");
	await passwordInput.fill(credential.password);
	page.getByText("Next").click();

	// Wait for the sign-out options link to appear (indicates successful login)
	await page.waitForSelector(
		'a[href^="https://accounts.google.com/SignOutOptions"]',
	);
	await page.goto("https://mail.google.com/mail/u/0/#inbox");
	// esperar por un elemento visible de la pagina de gmail para confirmar que se cargo gmail
	await page.waitForSelector("form#aso_search_form_anchor");
	await page.waitForTimeout(10000);
	await browser.close();
	return res.json({ success: true });
});

export default router;
