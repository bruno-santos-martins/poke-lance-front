import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // `npm run preview:e2e` serves the production build on this port.
    baseUrl: "http://localhost:4173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    responseTimeout: 15000,
    pageLoadTimeout: 60000,
    video: false,
    screenshotOnRunFailure: true,
    // One retry in CI absorbs runner hiccups; a test that fails twice still breaks the build.
    retries: { runMode: 1, openMode: 0 }
  }
});
