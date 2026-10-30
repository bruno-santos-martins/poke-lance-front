export type User = { id: string; name: string; role: "AUCTIONEER" | "BIDDER" };
export type PokemonSuggestion = { id: number; name: string };
export type Lot = {
  id: string;
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
export type Wallet = { balance: number; committed: number; available: number };
export type Audit = {
  lotId: string;
  valid: boolean;
  bids: { sequence: number; bidder: string; amount: number; timestamp: string; hash: string }[];
};
export type SellerReport = {
  lots: { id: string; title: string; settledAt: string | null; winner: string | null; amount: number }[];
  totalReceived: number;
};
export type SellerAuctionedLot = {
  id: string;
  pokemonId: number;
  title: string;
  imagePath: string;
  amount: number;
  settledAt: string | null;
  bidCount: number;
};
export type BidderReport = {
  wallet: Wallet;
  acquiredCards: { id: string; title: string; imagePath: string; amount: number; settledAt: string }[];
  bids: {
    id: string;
    lotId: string;
    lotTitle: string;
    amount: number;
    createdAt: string;
    status: "LEADING" | "OUTBID" | "WON" | "LOST" | "CANCELLED";
  }[];
  transactions: {
    id: string;
    type: "OPENING_BALANCE" | "OPENING_COMMITMENT" | "DEPOSIT" | "BID_COMMITTED" | "BID_RELEASED" | "AUCTION_DEBIT" | "AUCTION_CREDIT";
    amount: number;
    lotId: string | null;
    lotTitle: string | null;
    description: string;
    createdAt: string;
  }[];
};
