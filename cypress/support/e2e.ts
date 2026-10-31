import "./commands";

// Browser noise that is not an application failure. Anything else still fails the test.
const ignoredUncaughtErrors = [
  /ResizeObserver loop/,
  /AbortError/,
  /The user aborted a request/
];

Cypress.on("uncaught:exception", (error) => {
  if (ignoredUncaughtErrors.some((pattern) => pattern.test(error.message))) return false;
  return undefined;
});

beforeEach(() => {
  // Every test starts from the default light theme with no persisted preference.
  cy.clearLocalStorage();
});
