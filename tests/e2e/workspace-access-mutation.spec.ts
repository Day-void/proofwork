import { randomUUID } from "node:crypto";
import { Pool } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

const mutationsEnabled = process.env.PLAYWRIGHT_TEST_MUTATIONS === "1";
const baseUrl = process.env.PLAYWRIGHT_BASE_URL;
const testDatabaseUrl = process.env.TEST_DATABASE_URL_UNPOOLED?.trim().replace(/^(['"])(.*)\1$/, "$2");

test("employer signup creates a pending request while keeping learner access", async ({ page }) => {
  test.skip(!mutationsEnabled, "Set PLAYWRIGHT_TEST_MUTATIONS=1 to enable the local disposable-branch journey.");
  test.setTimeout(120_000);

  const hostname = baseUrl ? new URL(baseUrl).hostname : "";
  if (!new Set(["localhost", "127.0.0.1", "::1"]).has(hostname)) {
    throw new Error("Mutation E2E is restricted to a local app origin; no account was created.");
  }
  if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL_UNPOOLED is required; no account was created.");
  const databaseHost = new URL(testDatabaseUrl).hostname;
  if (!databaseHost.startsWith("ep-rough-forest-bezy1jow.")) {
    throw new Error("Mutation E2E is restricted to the proofwork-feature-test Neon branch; no account was created.");
  }

  const email = `proofwork-employer-${randomUUID()}@example.invalid`;
  const pool = new Pool({ connectionString: testDatabaseUrl, max: 1 });

  try {
    await page.goto("/register");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Your name").fill("ProofWork E2E Employer");
    await page.getByLabel("What brings you to ProofWork?").selectOption("employer");
    await page.getByLabel("Organization").fill("ProofWork automated test");
    await page.getByLabel("Why do you need this workspace?").fill("Verify that employer access requests stay pending until an administrator approves them.");
    await page.getByLabel("Password", { exact: true }).fill(`Test-${randomUUID()}-Aa1!`);
    await page.getByRole("button", { name: "Create my account" }).click();

    await expect(page).toHaveURL(/\/dashboard\?accessRequestSubmitted=1$/, { timeout: 30_000 });
    await expect(page.getByRole("status")).toContainText("Your workspace request is in.");

    const { rows } = await pool.query(
      `SELECT account.role, request.status, request.requested_role, request.organization
       FROM "user" AS account
       JOIN workspace_access_request AS request ON request.user_id = account.id
       WHERE account.email = $1`,
      [email],
    );
    expect(rows).toEqual([{
      role: "learner",
      status: "pending",
      requested_role: "employer",
      organization: "ProofWork automated test",
    }]);
  } finally {
    try {
      await pool.query(`DELETE FROM "user" WHERE email = $1`, [email]);
    } finally {
      await pool.end();
    }
  }
});
