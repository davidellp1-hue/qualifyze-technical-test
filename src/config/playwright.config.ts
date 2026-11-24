import { defineConfig, devices } from "@playwright/test";
import path from "path";

const projectRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  testDir: path.join(projectRoot, "src/features"),
  outputDir: path.join(projectRoot, "test-results"),
  fullyParallel: true,
  timeout: 40_000,
  retries: 1,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: path.join(projectRoot, "playwright-report"),
        open: "never",
      },
    ],
    [
      "allure-playwright",
      { resultsDir: path.join(projectRoot, "allure-results") },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "https://www.saucedemo.com",
    testIdAttribute: "data-test",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
