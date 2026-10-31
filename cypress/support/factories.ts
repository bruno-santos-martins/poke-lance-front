// Test data shaped like the backend API responses (amounts in centavos).

export type Role = "BIDDER" | "AUCTIONEER";

export type TestUser = { id: string; name: string; role: Role };

export type TestLot = {
  id: string;
  sellerId: string;
  title: string;
  imagePath: string;
  types: string[];
  height: number;
  weight: number;
  pokemonId: number;
  stats: Record<string, number>;
  startingBid: number;
  minimumIncrement: number;
  currentBid: number | null;
  endsAt: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  seller: string;
  latestBidder: string | null;
};

export type TestWallet = { balance: number; committed: number; available: number };

export const bidder: TestUser = { id: "8b0d3f5e-1111-4a6b-9c1d-000000000001", name: "Ash", role: "BIDDER" };
export const auctioneer: TestUser = { id: "8b0d3f5e-2222-4a6b-9c1d-000000000002", name: "Oak", role: "AUCTIONEER" };

export function buildLot(overrides: Partial<TestLot> = {}): TestLot {
  return {
    id: "3f1c2b7a-0000-4c1e-8d2a-000000000025",
    sellerId: auctioneer.id,
    title: "pikachu",
    imagePath: "/uploads/cards/pokemon-25-abc.png",
    types: ["electric"],
    height: 4,
    weight: 60,
    pokemonId: 25,
    stats: { hp: 35, attack: 55 },
    startingBid: 5000,
    minimumIncrement: 1000,
    currentBid: 10000,
    endsAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    status: "OPEN",
    seller: auctioneer.name,
    latestBidder: "Licitante #ABCD",
    ...overrides
  };
}

export function buildWallet(available = 50000, committed = 10000): TestWallet {
  return { balance: available + committed, committed, available };
}

/** Matches a BRL amount regardless of the non-breaking space Intl puts after "R$". */
export function brl(reais: string): RegExp {
  return new RegExp(`R\\$\\s${reais.replace(".", "\\.")}`);
}
