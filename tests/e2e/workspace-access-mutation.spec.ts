import { randomUUID } from "node:crypto";
import { Pool } from "@neondatabase/serverless";
import { expect, test, type BrowserContext } from "@playwright/test";

test.describe.configure({ mode: "serial" });

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
  if (!databaseHost.startsWith("ep-cool-fog-beasjboh.")) {
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

test("employer task invite, learner response, and feedback work end to end", async ({ browser }) => {
  test.skip(!mutationsEnabled, "Set PLAYWRIGHT_TEST_MUTATIONS=1 to enable the local disposable-branch journey.");
  test.setTimeout(240_000);

  const hostname = baseUrl ? new URL(baseUrl).hostname : "";
  if (!new Set(["localhost", "127.0.0.1", "::1"]).has(hostname)) {
    throw new Error("Mutation E2E is restricted to a local app origin; no accounts were created.");
  }
  if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL_UNPOOLED is required; no accounts were created.");
  const databaseHost = new URL(testDatabaseUrl).hostname;
  if (!databaseHost.startsWith("ep-cool-fog-beasjboh.")) {
    throw new Error("Mutation E2E is restricted to the proofwork-feature-test Neon branch; no accounts were created.");
  }

  const suffix = randomUUID();
  const employerEmail = `proofwork-task-employer-${suffix}@example.invalid`;
  const learnerEmail = `proofwork-task-learner-${suffix}@example.invalid`;
  const password = `Test-${randomUUID()}-Aa1!`;
  const employerPassword = `${password}E`;
  const learnerPassword = `${password}L`;
  const ids = {
    role: randomUUID(),
    rubric: randomUUID(),
    challenge: randomUUID(),
    project: randomUUID(),
    submission: randomUUID(),
    challengeSubmission: randomUUID(),
    verificationRequest: randomUUID(),
  };
  const pool = new Pool({ connectionString: testDatabaseUrl, max: 1 });
  let employerContext: BrowserContext | undefined;
  let learnerContext: BrowserContext | undefined;
  let previousDiscoverySetting: string | null | undefined;

  async function register(email: string, name: string, accountPassword: string) {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto("/register");
      await page.getByLabel("Email address").fill(email);
      await page.getByLabel("Your name").fill(name);
      await page.getByLabel("Password", { exact: true }).fill(accountPassword);
      await page.getByRole("button", { name: "Create my account" }).click();
      await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
    } finally {
      await context.close();
    }
  }

  async function signIn(page: import("@playwright/test").Page, email: string, accountPassword: string, expectedPath: string) {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(accountPassword);
    await page.getByRole("button", { name: "Continue to my workspace" }).click();
    await expect(page).toHaveURL(new RegExp(`${expectedPath}/?$`), { timeout: 30_000 });
  }

  try {
    await register(employerEmail, "ProofWork E2E Employer", employerPassword);
    await register(learnerEmail, "ProofWork E2E Learner", learnerPassword);
    const [employer] = (await pool.query(`SELECT id FROM "user" WHERE email = $1`, [employerEmail])).rows;
    const [learner] = (await pool.query(`SELECT id FROM "user" WHERE email = $1`, [learnerEmail])).rows;
    expect(employer?.id).toBeTruthy();
    expect(learner?.id).toBeTruthy();

    const [setting] = (await pool.query(`SELECT value FROM platform_setting WHERE key = 'employer_discovery_enabled'`)).rows;
    previousDiscoverySetting = setting?.value;
    await pool.query(`INSERT INTO platform_setting (key, value) VALUES ('employer_discovery_enabled', 'true')
      ON CONFLICT (key) DO UPDATE SET value = 'true', updated_at = now()`);
    await pool.query(`UPDATE "user" SET role = 'employer' WHERE id = $1`, [employer.id]);
    await pool.query(`INSERT INTO learner_profile (id, user_id, headline, discoverable) VALUES ($1, $2, 'QA Analyst', true)`, [randomUUID(), learner.id]);
    await pool.query(`INSERT INTO assessment_role (id, slug, title, target_level, description, active)
      VALUES ($1, $2, 'QA Analyst', 'entry', 'Synthetic role for an isolated UI test.', true)`, [ids.role, `e2e-${suffix}`]);
    await pool.query(`INSERT INTO rubric_version (id, role_id, version, title) VALUES ($1, $2, 1, 'Synthetic rubric')`, [ids.rubric, ids.role]);
    await pool.query(`INSERT INTO role_challenge (id, role_id, version, title, brief, acceptance_criteria, status)
      VALUES ($1, $2, 1, 'Synthetic challenge', 'Test fixture.', 'Test fixture.', 'published')`, [ids.challenge, ids.role]);
    await pool.query(`INSERT INTO learner_project (id, learner_id, title, summary, skill_area) VALUES ($1, $2, 'Synthetic project', 'Synthetic project for an isolated UI test.', 'Quality assurance')`, [ids.project, learner.id]);
    await pool.query(`INSERT INTO project_submission (id, project_id, version, status) VALUES ($1, $2, 1, 'submitted')`, [ids.submission, ids.project]);
    await pool.query(`INSERT INTO challenge_submission (id, challenge_id, learner_id, version, status)
      VALUES ($1, $2, $3, 1, 'submitted')`, [ids.challengeSubmission, ids.challenge, learner.id]);
    await pool.query(`INSERT INTO verification_request (id, learner_id, role_id, rubric_version_id, portfolio_submission_id, challenge_submission_id, status, discoverable)
      VALUES ($1, $2, $3, $4, $5, $6, 'approved', true)`, [ids.verificationRequest, learner.id, ids.role, ids.rubric, ids.submission, ids.challengeSubmission]);

    employerContext = await browser.newContext();
    learnerContext = await browser.newContext();
    const employerPage = await employerContext.newPage();
    const learnerPage = await learnerContext.newPage();
    await signIn(employerPage, employerEmail, employerPassword, "/employer");
    await signIn(learnerPage, learnerEmail, learnerPassword, "/dashboard");

    await employerPage.goto("/employer/tasks");
    await expect(employerPage.getByLabel("Learner")).toContainText("ProofWork E2E Learner · QA Analyst");
    await employerPage.getByLabel("Learner").selectOption(learner.id);
    await employerPage.getByLabel("Task title").fill("Review a sample checkout flow");
    await employerPage.getByLabel("Skill area").fill("Quality assurance");
    await employerPage.getByLabel("Instructions").fill("Review the sample checkout flow and describe the most important issues you would investigate.");
    await employerPage.getByLabel("What you will look for").fill("Clear test priorities, edge cases, and concise communication.");
    const invitationResponse = employerPage.waitForResponse((response) => {
      const request = response.request();
      return request.method() === "POST" && new URL(response.url()).pathname === "/employer/tasks";
    }, { timeout: 30_000 }).catch(() => null);
    await employerPage.getByRole("button", { name: "Send task invitation" }).click();
    const actionResponse = await invitationResponse;
    expect(actionResponse?.status()).toBe(200);
    await expect(employerPage.getByRole("button", { name: "Send task invitation" })).toBeEnabled({ timeout: 30_000 });
    await expect(employerPage.getByRole("status")).toContainText("Invitation sent.", { timeout: 30_000 });

    await learnerPage.goto("/dashboard/tasks");
    await expect(learnerPage.getByRole("heading", { name: "Review a sample checkout flow" })).toBeVisible();
    await learnerPage.getByRole("button", { name: "Accept task" }).click();
    await expect(learnerPage.getByLabel("Your response")).toBeVisible({ timeout: 30_000 });
    await learnerPage.getByLabel("Your response").fill("I would test successful payment, declined cards, retries, expired sessions, and keyboard-only completion. I would report each issue with reproducible steps and expected behavior.");
    await learnerPage.getByRole("button", { name: "Submit task response" }).click();
    await expect(learnerPage.getByText("Your submitted response")).toBeVisible({ timeout: 30_000 });
    await expect(learnerPage.getByText("I would test successful payment", { exact: false })).toBeVisible();

    await employerPage.goto("/employer/tasks");
    await expect(employerPage.getByText("I would test successful payment", { exact: false })).toBeVisible();
    await employerPage.getByLabel("Feedback for the learner").fill("Good coverage of payment failures and recovery. Add one accessibility check for the payment form.");
    await employerPage.getByRole("button", { name: "Send feedback" }).click();
    await expect(employerPage.getByRole("heading", { name: "Feedback sent" })).toBeVisible({ timeout: 30_000 });
    await expect(employerPage.getByText("Add one accessibility check", { exact: false })).toBeVisible();

    await learnerPage.goto("/dashboard/tasks");
    await expect(learnerPage.getByText("Good coverage of payment failures and recovery.", { exact: false })).toBeVisible();
    const [completedTask] = (await pool.query(`SELECT status, learner_response, employer_feedback FROM employer_task WHERE employer_id = $1 AND learner_id = $2`, [employer.id, learner.id])).rows;
    expect(completedTask).toMatchObject({
      status: "reviewed",
      learner_response: expect.stringContaining("successful payment"),
      employer_feedback: expect.stringContaining("Add one accessibility check"),
    });
  } finally {
    await employerContext?.close();
    await learnerContext?.close();
    try {
      const [employer] = (await pool.query(`SELECT id FROM "user" WHERE email = $1`, [employerEmail])).rows;
      const [learner] = (await pool.query(`SELECT id FROM "user" WHERE email = $1`, [learnerEmail])).rows;
      if (learner?.id) {
        await pool.query(`DELETE FROM verification_request WHERE learner_id = $1`, [learner.id]);
        await pool.query(`DELETE FROM challenge_submission WHERE learner_id = $1`, [learner.id]);
        await pool.query(`DELETE FROM project_submission WHERE project_id = $1`, [ids.project]);
        await pool.query(`DELETE FROM learner_project WHERE id = $1`, [ids.project]);
        await pool.query(`DELETE FROM learner_profile WHERE user_id = $1`, [learner.id]);
      }
      await pool.query(`DELETE FROM role_challenge WHERE id = $1`, [ids.challenge]);
      await pool.query(`DELETE FROM rubric_version WHERE id = $1`, [ids.rubric]);
      await pool.query(`DELETE FROM assessment_role WHERE id = $1`, [ids.role]);
      await pool.query(`DELETE FROM "user" WHERE id = ANY($1::text[])`, [[employer?.id, learner?.id].filter(Boolean)]);
      if (previousDiscoverySetting === undefined) {
        await pool.query(`DELETE FROM platform_setting WHERE key = 'employer_discovery_enabled'`);
      } else {
        await pool.query(`UPDATE platform_setting SET value = $1, updated_at = now() WHERE key = 'employer_discovery_enabled'`, [previousDiscoverySetting]);
      }
    } finally {
      await pool.end();
    }
  }
});
