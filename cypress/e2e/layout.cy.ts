import { bidder, buildLot } from "../support/factories";

// Smoke test: cada página e modal principal abre e mostra o conteúdo esperado.
describe("Páginas abrem", () => {
  it("abre a vitrine (página inicial)", () => {
    cy.visitAsGuest();

    cy.contains("h1", "próxima raridade").should("be.visible");
    cy.get("[data-cy=lot-card]").should("have.length.at.least", 1);
  });

  it("abre a página Como funciona", () => {
    cy.mockApi();
    cy.visit("/como-funciona");

    cy.contains("h1", "Como funciona").should("be.visible");
    cy.contains("h2", "Como dar um lance").should("be.visible");
  });

  it("abre a página de comprovativo", () => {
    const lot = buildLot({ status: "CLOSED" });
    cy.mockApi();
    cy.intercept("GET", `**/api/receipts/${lot.id}`, {
      body: { title: "pikachu", imagePath: lot.imagePath, amount: 12000, winner: "Licitante #ABCD", isCurrentUserWinner: false }
    });
    cy.visit(`/receipt/${lot.id}`);

    cy.contains("h1", "pikachu").should("be.visible");
  });

  it("abre o modal de login", () => {
    cy.visitAsGuest();
    cy.get("[data-cy=btn-login]").click();

    cy.get("[data-cy=auth-modal]").should("be.visible");
  });

  it("abre o modal de detalhes do lote", () => {
    cy.login(bidder);
    cy.openLot("pikachu");

    cy.get("[data-cy=lot-modal]").should("be.visible");
    cy.get("[data-cy=input-bid]").should("be.visible");
  });
});
