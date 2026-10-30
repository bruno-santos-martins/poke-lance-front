import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["AUCTIONEER", "BIDDER"])
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const createLotSchema = z.object({
  pokemon: z.string().trim().min(1).max(64),
  startingBid: z.number().int().positive(),
  minimumIncrement: z.number().int().positive().default(100),
  durationMinutes: z.number().int().min(1).max(10080).default(60)
});

export const pokemonSearchSchema = z.object({
  q: z.string().trim().min(1).max(64)
});

export const bidSchema = z.object({
  amount: z.number().int().positive()
});

export const depositSchema = z.object({
  amount: z.number().int().min(100).max(1_000_000)
});
