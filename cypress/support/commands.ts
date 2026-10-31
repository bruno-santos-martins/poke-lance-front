import { bidder, buildLot, buildWallet, type TestLot, type TestUser, type TestWallet } from "./factories";

type MockApiOptions = {
  user?: TestUser | null;
  lots?: TestLot[];
  wallet?: TestWallet;
};

type Theme = "light" | "dark";

// 1x1 transparent PNG so card images never hit the network.
const transparentPng = Cypress.Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Stubs the backend: session, lot list/detail, wallet, logout, uploads. */
      mockApi(options?: MockApiOptions): Chainable<void>;
      /** Opens the app with an authenticated session for the given user (defaults to a bidder). */
      login(user?: TestUser, options?: Omit<MockApiOptions, "user">): Chainable<void>;
      /** Opens the app as an anonymous visitor. */
      visitAsGuest(options?: Omit<MockApiOptions, "user">): Chainable<void>;
      /** Switches the theme through the header toggle and waits for the tokens to apply. */
      setTheme(theme: Theme): Chainable<void>;
      /** Opens the details modal of the lot card with the given title. */
      openLot(title: string): Chainable<JQuery<HTMLElement>>;
      /** Replays a Socket.IO server event into the app's socket listeners. */
      emitSocketEvent(event: string, payload?: unknown): Chainable<void>;
    }
  }
}

Cypress.Commands.add("mockApi", ({ user = null, lots = [buildLot()], wallet = buildWallet() } = {}) => {
  cy.intercept("GET", "**/api/auth/session", { body: { user } }).as("session");
  cy.intercept("GET", "**/api/lots", { body: lots }).as("getLots");
  for (const lot of lots) {
    cy.intercept("GET", `**/api/lots/${lot.id}`, { body: lot }).as("getLot");
  }
  cy.intercept("GET", "**/api/wallet", { body: wallet }).as("getWallet");
  cy.intercept("POST", "**/api/auth/logout", { body: {} }).as("logout");
  cy.intercept("GET", "**/uploads/**", { body: transparentPng, headers: { "content-type": "image/png" } });
  // No backend in E2E: keep Socket.IO from polling a server that does not exist.
  cy.intercept("**/socket.io/**", { statusCode: 503, body: "" });
});

Cypress.Commands.add("login", (user, options = {}) => {
  cy.mockApi({ ...options, user: user ?? bidder });
  cy.visit("/");
  cy.wait(["@session", "@getLots"]);
  cy.get("[data-cy=user-avatar]").should("be.visible");
});

Cypress.Commands.add("visitAsGuest", (options = {}) => {
  cy.mockApi({ ...options, user: null });
  cy.visit("/");
  cy.wait(["@session", "@getLots"]);
  cy.get("[data-cy=btn-login]").should("be.visible");
});

Cypress.Commands.add("setTheme", (theme) => {
  cy.document().then((document) => {
    if (document.documentElement.dataset.theme !== theme) {
      cy.get("[data-cy=theme-toggle]").click();
    }
  });
  cy.get("html").should("have.attr", "data-theme", theme);
});

Cypress.Commands.add("openLot", (title) => {
  cy.contains("[data-cy=lot-card]", title).find("[data-cy=btn-open-lot]").click();
  return cy.get("[data-cy=lot-modal]").should("be.visible");
});

Cypress.Commands.add("emitSocketEvent", (event, payload) => {
  cy.window().its("__auctionSocket").should("exist").then((socket) => {
    const listeners = (socket as unknown as { listeners: (name: string) => ((data: unknown) => void)[] }).listeners(event);
    expect(listeners, `listeners for "${event}"`).to.have.length.greaterThan(0);
    listeners.forEach((listener) => listener(payload));
  });
});

export {};
