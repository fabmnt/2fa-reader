import cors from "cors";
import express from "express";
import morgan from "morgan";
import { chromium } from "playwright";
import UserAgent from "user-agents";

const app = express();
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors());
app.use(express.json());

app.get("/", async (_, res) => {
	console.log("Launching browser");
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
	await emailInput.fill("fabianmontoyanic");
	page.getByText("Next").click();
	const passwordInput = await page.waitForSelector("input[type=password]");
	await passwordInput.fill(process.env.PASSWORD || "");
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

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
