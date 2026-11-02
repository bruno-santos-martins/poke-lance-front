import { bidder, buildLot } from "../support/factories";

describe("Autenticação", () => {
  it("bloqueia o formulário de lance para visitantes e pede login", () => {
    cy.visitAsGuest();

    cy.openLot("pikachu");

    cy.get("[data-cy=input-bid]").should("not.exist");
    cy.get("[data-cy=btn-submit-bid]").should("not.exist");
    cy.get("[data-cy=btn-login-to-bid]").click();
    cy.get("[data-cy=auth-modal]").should("be.visible");
  });

  it("valida campos vazios e inválidos sem chamar a API", () => {
    cy.intercept("POST", "**/api/auth/login").as("loginRequest");
    cy.visitAsGuest();
    cy.get("[data-cy=btn-login]").click();

    cy.get("[data-cy=btn-submit-auth]").should("be.disabled");

    cy.get("[data-cy=input-email]").type("ash@");
    cy.get("[data-cy=error-email]").should("have.text", "Informe um e-mail válido.");

    cy.get("[data-cy=input-password]").type("curta");
    cy.get("[data-cy=error-password]").should("have.text", "A senha deve ter pelo menos 8 caracteres.");

    cy.get("[data-cy=input-email]").clear();
    cy.get("[data-cy=error-email]").should("have.text", "Informe um e-mail válido.");
    cy.get("[data-cy=btn-submit-auth]").should("be.disabled");

    cy.get("@loginRequest.all").should("have.length", 0);
  });

  it("exige nome no registo", () => {
    cy.visitAsGuest();
    cy.get("[data-cy=btn-login]").click();
    cy.get("[data-cy=btn-toggle-auth-mode]").click();

    cy.get("[data-cy=input-name]").type("A").clear();
    cy.get("[data-cy=input-email]").type("ash@poke.com");
    cy.get("[data-cy=input-password]").type("pikachu123");

    cy.get("[data-cy=error-name]").should("have.text", "Informe um nome com pelo menos 2 caracteres.");
    cy.get("[data-cy=btn-submit-auth]").should("be.disabled");
  });

  it("faz login com sucesso e mostra a carteira do licitante", () => {
    cy.intercept("POST", "**/api/auth/login", { body: { user: bidder, token: "mock-jwt-token" } }).as("loginRequest");
    cy.visitAsGuest();
    cy.get("[data-cy=btn-login]").click();

    cy.get("[data-cy=input-email]").type("ash@poke.com");
    cy.get("[data-cy=input-password]").type("pikachu123");
    cy.get("[data-cy=btn-submit-auth]").should("be.enabled").click();

    cy.wait("@loginRequest").its("request.body").should("deep.equal", {
      email: "ash@poke.com",
      password: "pikachu123"
    });
    cy.get("[data-cy=auth-modal]").should("not.exist");
    cy.get("[data-cy=user-avatar]").should("have.attr", "aria-label", "Abrir perfil de Ash");
    cy.get("[data-cy=wallet-pill]").should("be.visible");
    cy.get("[data-cy=toast]").should("contain.text", "Bem-vindo, Ash!");
  });

  it("mostra o erro do servidor quando as credenciais são inválidas", () => {
    cy.intercept("POST", "**/api/auth/login", { statusCode: 401, body: { error: "Credenciais inválidas." } }).as("loginRequest");
    cy.visitAsGuest();
    cy.get("[data-cy=btn-login]").click();

    cy.get("[data-cy=input-email]").type("ash@poke.com");
    cy.get("[data-cy=input-password]").type("senha-errada");
    cy.get("[data-cy=btn-submit-auth]").click();

    cy.wait("@loginRequest");
    cy.get("[data-cy=toast]").should("have.attr", "role", "alert").and("contain.text", "Credenciais inválidas.");
    cy.get("[data-cy=auth-modal]").should("be.visible");
    cy.get("[data-cy=user-avatar]").should("not.exist");
  });

  it("termina a sessão", () => {
    cy.login(bidder, { lots: [buildLot()] });

    cy.get("[data-cy=btn-logout]").click();

    cy.wait("@logout");
    cy.get("[data-cy=btn-login]").should("be.visible");
    cy.get("[data-cy=wallet-pill]").should("not.exist");
  });
});
