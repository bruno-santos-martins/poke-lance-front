import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") return error.code;
  return undefined;
}

async function main() {
  const seller = await prisma.user.upsert({
    where: { email: "vendedor@leilao.local" },
    update: {},
    create: { name: "Leiloeiro Verzel", email: "vendedor@leilao.local", passwordHash: await bcrypt.hash("Senha123!", 10), role: Role.AUCTIONEER }
  });
  const bidders = [];
  for (const [name, email] of [["Ana Silva", "ana@leilao.local"], ["Bruno Melo", "bruno@leilao.local"]]) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, passwordHash: await bcrypt.hash("Senha123!", 10), role: Role.BIDDER, wallet: { create: { balance: 50000 } } }
    });
    await prisma.wallet.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, balance: 50000 } });
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: user.id } });
    if (wallet.balance === 0 && wallet.committed === 0) await prisma.wallet.update({ where: { userId: user.id }, data: { balance: 50000 } });
    bidders.push(user);
  }
  await prisma.wallet.upsert({ where: { userId: seller.id }, update: {}, create: { userId: seller.id } });

  const openLot = await prisma.lot.findFirst({ where: { sellerId: seller.id, status: "OPEN" } });
  const cardsDir = path.resolve(process.env.UPLOADS_DIR ?? "./uploads", "cards");
  await mkdir(cardsDir, { recursive: true });
  const imagePath = `/uploads/cards/pokemon-25-seed.svg`;
  try {
    await writeFile(path.join(cardsDir, "pokemon-25-seed.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360"><rect width="100%" height="100%" fill="#fef3c7"/><text x="50%" y="50%" text-anchor="middle" font-size="32" fill="#b45309">Pikachu</text></svg>', { flag: "wx" });
  } catch (error) {
    if (getErrorCode(error) !== "EEXIST") throw error;
  }
  if (!openLot) {
    const lot = await prisma.lot.create({
      data: { sellerId: seller.id, pokemonId: 25, title: "Pikachu #025", imagePath, types: ["electric"], height: 4, weight: 60, stats: { hp: 35, attack: 55, defense: 40, "special-attack": 50, "special-defense": 50, speed: 90 }, startingBid: 1000, minimumIncrement: 100, currentBid: 1200, endsAt: new Date(Date.now() + 60 * 60 * 1000) }
    });
    let previousHash: string | null = null;
    let sequence = 0;
    for (const [bidderId, amount] of [[bidders[0].id, 1000], [bidders[1].id, 1200]] as const) {
      const id = randomUUID();
      const createdAt = new Date();
      const currentHash = hash(`${id}${lot.id}${bidderId}${amount}${createdAt.toISOString()}${previousHash ?? ""}`);
      await prisma.bid.create({ data: { id, lotId: lot.id, bidderId, sequence: ++sequence, amount, createdAt, previousHash, hash: currentHash } });
      previousHash = currentHash;
    }
    await prisma.wallet.update({ where: { userId: bidders[1].id }, data: { committed: 1200 } });
  }
  for (const bidder of bidders) {
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: bidder.id } });
    const transactionCount = await prisma.walletTransaction.count({ where: { walletUserId: bidder.id } });
    if (transactionCount === 0 && wallet.balance > 0) {
      await prisma.walletTransaction.create({
        data: {
          walletUserId: bidder.id,
          type: "OPENING_BALANCE",
          amount: wallet.balance,
          description: "Saldo disponível no início do extrato"
        }
      });
      if (wallet.committed > 0) await prisma.walletTransaction.create({
        data: {
          walletUserId: bidder.id,
          type: "OPENING_COMMITMENT",
          amount: wallet.committed,
          description: "Lances ativos no início do extrato"
        }
      });
    }
  }
  console.log("Seed concluído. Utilizadores de demonstração usam a senha Senha123!.");
}

main().finally(() => prisma.$disconnect());
