import { AppError } from "../../../../core/domain/errors";
import { BidderReport, IBidderReportRepository } from "../../../../core/ports/repositories";
import { prisma } from "./client";

export class PrismaBidderReportRepository implements IBidderReportRepository {
  async getForBidder(userId: string): Promise<BidderReport> {
    const [wallet, bids, transactions, acquiredCards] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.bid.findMany({
        where: { bidderId: userId },
        include: {
          lot: {
            select: {
              id: true,
              title: true,
              status: true,
              winnerId: true,
              bids: { orderBy: { sequence: "desc" }, take: 1, select: { bidderId: true } }
            }
          }
        },
        orderBy: [{ createdAt: "desc" }, { sequence: "desc" }]
      }),
      prisma.walletTransaction.findMany({
        where: { walletUserId: userId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }]
      }),
      prisma.lot.findMany({
        where: { winnerId: userId, status: "CLOSED", settledAt: { not: null } },
        select: {
          id: true,
          title: true,
          imagePath: true,
          settledAt: true,
          bids: { orderBy: { sequence: "desc" }, take: 1, select: { amount: true } }
        },
        orderBy: { settledAt: "desc" }
      })
    ]);

    if (!wallet) throw new AppError("Carteira não encontrada.", 404);
    return {
      wallet: {
        userId: wallet.userId,
        balance: wallet.balance,
        committed: wallet.committed,
        available: wallet.balance - wallet.committed
      },
      acquiredCards: acquiredCards.map((lot) => {
        if (!lot.settledAt) throw new AppError("Data de liquidação em falta para um lote arrematado.", 500);
        return {
          id: lot.id,
          title: lot.title,
          imagePath: lot.imagePath,
          amount: lot.bids[0]?.amount ?? 0,
          settledAt: lot.settledAt
        };
      }),
      bids: bids.map((bid) => {
        let status: BidderReport["bids"][number]["status"];
        if (bid.lot.status === "CANCELLED") status = "CANCELLED";
        else if (bid.lot.status === "CLOSED") status = bid.lot.winnerId === userId ? "WON" : "LOST";
        else status = bid.lot.bids[0]?.bidderId === userId ? "LEADING" : "OUTBID";
        return {
          id: bid.id,
          lotId: bid.lotId,
          lotTitle: bid.lot.title,
          amount: bid.amount,
          createdAt: bid.createdAt,
          status
        };
      }),
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        lotId: transaction.lotId,
        lotTitle: transaction.lotTitle,
        description: transaction.description,
        createdAt: transaction.createdAt
      }))
    };
  }
}
