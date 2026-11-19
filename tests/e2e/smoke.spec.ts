import { expect, test } from "@playwright/test";

test.describe("public entry and guest access", () => {
  test("landing page leads into registration", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Make your skills visible");
    await page.getByRole("link", { name: "Create portfolio" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "Give your work a place to grow" })).toBeVisible();
  });

  test("workspace request asks for organization and reason only for elevated access", async ({ page }) => {
    await page.goto("/register");

    const workspace = page.getByLabel("What brings you to ProofWork?");
    await expect(workspace).toHaveValue("learner");
    await expect(page.getByText(/Every new account starts as a learner/i)).toBeVisible();
    await expect(page.getByLabel("Organization")).toHaveCount(0);

    await workspace.selectOption("employer");
    await expect(page.getByLabel("Organization")).toBeVisible();
    await expect(page.getByLabel("Why do you need this workspace?")).toBeVisible();

    await workspace.selectOption("learner");
    await expect(page.getByLabel("Organization")).toHaveCount(0);
    await expect(page.getByLabel("Why do you need this workspace?")).toHaveCount(0);
  });

  for (const route of ["/dashboard", "/assessor", "/employer", "/admin", "/admin/users"]) {
    test(`${route} redirects a signed-out visitor to login`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(/\/login(?:\?|$)/);
      await expect(page.getByRole("heading", { name: "Your work is waiting" })).toBeVisible();
    });
  }
});
