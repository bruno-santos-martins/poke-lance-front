import { prisma } from "./client";
import { IWalletRepository } from "../../../../core/ports/repositories";
import { Wallet } from "../../../../core/domain/entities";

function toWallet(row: { userId: string; balance: number; committed: number }): Wallet {
  return { userId: row.userId, balance: row.balance, committed: row.committed, available: row.balance - row.committed };
}

export class PrismaWalletRepository implements IWalletRepository {
  async findByUserId(userId: string): Promise<Wallet | null> {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    return wallet ? toWallet(wallet) : null;
  }

  async deposit(userId: string, amount: number): Promise<Wallet> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount }
      });
      await tx.walletTransaction.create({
        data: { walletUserId: userId, type: "DEPOSIT", amount, description: "Depósito simulado na carteira" }
      });
      return toWallet(wallet);
    });
  }

  async ensure(userId: string): Promise<void> {
    await prisma.wallet.upsert({ where: { userId }, update: {}, create: { userId } });
  }
}
