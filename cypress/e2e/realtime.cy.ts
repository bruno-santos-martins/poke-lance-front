import { bidder, brl, buildLot, buildWallet } from "../support/factories";

describe("Tempo real (WebSocket) e cronómetro", () => {
  it("atualiza o lance do lote aberto quando chega um bid:placed", () => {
    const lot = buildLot({ currentBid: 10000 });
    cy.login(bidder, { lots: [lot] });
    cy.openLot(lot.title);
    cy.get("[data-cy=lot-current-bid]").invoke("text").should("match", brl("100,00"));

    const outbidLot = { ...lot, currentBid: 15000, latestBidder: "Licitante #FFFF" };
    cy.intercept("GET", "**/api/lots", { body: [outbidLot] }).as("getLots");
    cy.intercept("GET", `**/api/lots/${lot.id}`, { body: outbidLot }).as("getLot");
    cy.emitSocketEvent("bid:placed", { lotId: lot.id, amount: 15000 });

    cy.wait(["@getLots", "@getLot"]);
    cy.get("[data-cy=lot-current-bid]").invoke("text").should("match", brl("150,00"));
  });

  it("recarrega a vitrine quando chega um lots:updated", () => {
    cy.visitAsGuest({ lots: [buildLot()] });
    cy.get("[data-cy=lot-card]").should("have.length", 1);

    const newLot = buildLot({ id: "3f1c2b7a-0000-4c1e-8d2a-000000000006", title: "charizard", pokemonId: 6, types: ["fire"] });
    cy.intercept("GET", "**/api/lots", { body: [buildLot(), newLot] }).as("getLots");
    cy.emitSocketEvent("lots:updated", { lotId: newLot.id });

    cy.wait("@getLots");
    cy.get("[data-cy=lot-card]").should("have.length", 2);
    cy.contains("[data-cy=lot-card]", "charizard").should("be.visible");
  });

  it("atualiza a carteira quando chega um wallet:updated", () => {
    cy.login(bidder, { wallet: buildWallet(50000) });
    cy.get("[data-cy=wallet-pill]").invoke("text").should("match", brl("500,00"));

    cy.emitSocketEvent("wallet:updated", buildWallet(42000, 18000));

    cy.get("[data-cy=wallet-pill]").invoke("text").should("match", brl("420,00"));
  });

  it("faz a contagem regressiva e encerra o lote", () => {
    const now = new Date("2026-10-31T12:00:00Z").getTime();
    // Freeze only the clock used by the countdown; other timers keep running.
    cy.clock(now, ["Date", "setInterval", "clearInterval"]);
    const lot = buildLot({ endsAt: new Date(now + 65_000).toISOString() });
    cy.visitAsGuest({ lots: [lot] });

    cy.get("[data-cy=lot-card] [data-cy=countdown]").should("contain.text", "00:01:05");

    cy.tick(1000);
    cy.get("[data-cy=lot-card] [data-cy=countdown]").should("contain.text", "00:01:04");

    cy.tick(64_000);
    cy.get("[data-cy=lot-card] [data-cy=countdown]").should("contain.text", "Encerrado");
  });
});
