import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL === "chromium" ? "chromium" : "chrome",
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "https://proofwork-steel.vercel.app",
    trace: "retain-on-failure",
  },
});
