export type UserRole = "AUCTIONEER" | "BIDDER";
export type AuctionStatus = "OPEN" | "CLOSED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Wallet {
  userId: string;
  balance: number;
  committed: number;
  available: number;
}

export interface Lot {
  id: string;
  sellerId: string;
  title: string;
  imagePath: string;
  startingBid: number;
  minimumIncrement: number;
  currentBid: number | null;
  endsAt: Date;
  status: AuctionStatus;
}

export interface Bid {
  id: string;
  lotId: string;
  bidderId: string;
  sequence: number;
  amount: number;
  createdAt: Date;
  previousHash: string | null;
  hash: string;
}
