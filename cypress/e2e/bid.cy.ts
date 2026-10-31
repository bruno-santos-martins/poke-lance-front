import { bidder, brl, buildLot, buildWallet } from "../support/factories";

// Current bid R$ 100,00 + increment R$ 10,00 → minimum accepted bid R$ 110,00.
const lot = buildLot({ currentBid: 10000, minimumIncrement: 1000 });

describe("Formulário de lance (Zod + React Hook Form)", () => {
  beforeEach(() => {
    cy.intercept("POST", `**/api/lots/${lot.id}/bids`).as("placeBid");
    cy.login(bidder, { lots: [lot], wallet: buildWallet(50000) });
    cy.openLot(lot.title);
    cy.get("[data-cy=lot-current-bid]").should("contain.text", "100,00");
  });

  it("recusa um lance abaixo do mínimo sem disparar a requisição", () => {
    cy.get("[data-cy=input-bid]").type("105");

    cy.get("[data-cy=bid-error]").invoke("text").should("match", /O lance mínimo é R\$\s110,00\./);
    cy.get("[data-cy=btn-submit-bid]").should("be.disabled");
    cy.get("[data-cy=input-bid]").type("{enter}");

    cy.get("@placeBid.all").should("have.length", 0);
  });

  it("recusa entradas não numéricas, vazias e negativas", () => {
    cy.get("[data-cy=input-bid]").type("abc").should("have.value", "");
    cy.get("[data-cy=btn-submit-bid]").should("be.disabled");

    cy.get("[data-cy=input-bid]").type("120").clear();
    cy.get("[data-cy=bid-error]").should("have.text", "Informe o valor do lance.");

    cy.get("[data-cy=input-bid]").type("-5");
    cy.get("[data-cy=bid-error]").should("have.text", "O lance deve ser maior que zero.");
    cy.get("[data-cy=btn-submit-bid]").should("be.disabled");

    cy.get("@placeBid.all").should("have.length", 0);
  });

  it("aceita exatamente o lance mínimo", () => {
    cy.get("[data-cy=input-bid]").type("110");

    cy.get("[data-cy=bid-error]").should("not.exist");
    cy.get("[data-cy=btn-submit-bid]").should("be.enabled");
  });

  it("envia um lance válido em centavos e atualiza o estado em tela", () => {
    const updatedLot = { ...lot, currentBid: 12000, latestBidder: "Licitante #8B0D" };
    cy.intercept("POST", `**/api/lots/${lot.id}/bids`, { statusCode: 201, body: { id: "bid-1" } }).as("placeBid");
    cy.intercept("GET", "**/api/lots", { body: [updatedLot] }).as("getLots");
    cy.intercept("GET", `**/api/lots/${lot.id}`, { body: updatedLot }).as("getLot");
    cy.intercept("GET", "**/api/wallet", { body: buildWallet(38000, 12000) }).as("getWallet");

    cy.get("[data-cy=input-bid]").type("120");
    cy.get("[data-cy=btn-submit-bid]").should("be.enabled").click();

    cy.wait("@placeBid").its("request.body").should("deep.equal", { amount: 12000 });
    cy.get("[data-cy=toast]").should("contain.text", "Lance registado e saldo comprometido.");
    cy.get("[data-cy=lot-current-bid]").invoke("text").should("match", brl("120,00"));
    cy.get("[data-cy=input-bid]").should("have.value", "");
    cy.get("[data-cy=wallet-pill]").invoke("text").should("match", brl("380,00"));
  });

  it("mostra o erro devolvido pelo servidor", () => {
    cy.intercept("POST", `**/api/lots/${lot.id}/bids`, {
      statusCode: 409,
      body: { error: "Saldo disponível insuficiente." }
    }).as("placeBid");

    cy.get("[data-cy=input-bid]").type("120");
    cy.get("[data-cy=btn-submit-bid]").click();

    cy.wait("@placeBid");
    cy.get("[data-cy=toast]").should("have.attr", "role", "alert").and("contain.text", "Saldo disponível insuficiente.");
    cy.get("[data-cy=lot-current-bid]").should("contain.text", "100,00");
  });
});
