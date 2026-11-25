import {defineConfig, devices} from "@playwright/test";

const PORT = 5199;

// End-to-end tests of what happens on screen, in Chromium: pnpm test:e2e
export default defineConfig({
    testDir: ".",
    outputDir: "../test-results",
    testMatch: "**/*.e2e.ts",
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["list"], ["html", {open: "never", outputFolder: "../playwright-report"}]] : "list",
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "retain-on-failure",
    },
    projects: [
        {name: "chromium", use: {...devices["Desktop Chrome"]}},
    ],
    webServer: {
        command: `pnpm exec vite --port ${PORT} --strictPort`,
        // the application is at the root of the repository, next to this folder
        cwd: "..",
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
    },
});
