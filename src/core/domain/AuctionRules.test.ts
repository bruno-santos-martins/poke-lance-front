import { describe, expect, it } from "vitest";
import { availableBalance, isAntiSnipingWindow, minimumBid } from "./AuctionRules";

describe("regras do leilão", () => {
  it("aplica o lance inicial e o incremento mínimo", () => {
    expect(minimumBid(null, 1000, 100)).toBe(1000);
    expect(minimumBid(1250, 1000, 100)).toBe(1350);
  });

  it("considera saldo comprometido no cálculo do disponível", () => {
    expect(availableBalance(5000, 1200)).toBe(3800);
  });

  it("prorroga apenas quando o lote está dentro dos últimos dois minutos", () => {
    const now = new Date("2026-10-29T12:00:00.000Z");
    expect(isAntiSnipingWindow(new Date(now.getTime() + 120_000), now)).toBe(true);
    expect(isAntiSnipingWindow(new Date(now.getTime() + 120_001), now)).toBe(false);
    expect(isAntiSnipingWindow(new Date(now.getTime() - 1), now)).toBe(false);
  });
});
