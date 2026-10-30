import { prisma } from "./client";
import { ILotRepository, NewLot } from "../../../../core/ports/repositories";
import { Lot } from "../../../../core/domain/entities";
import { AppError } from "../../../../core/domain/errors";

function toLot(row: {
  id: string; sellerId: string; title: string; imagePath: string; startingBid: number;
  minimumIncrement: number; currentBid: number | null; endsAt: Date; status: "OPEN" | "CLOSED" | "CANCELLED";
}): Lot {
  return {
    id: row.id, sellerId: row.sellerId, title: row.title, imagePath: row.imagePath,
    startingBid: row.startingBid, minimumIncrement: row.minimumIncrement,
    currentBid: row.currentBid, endsAt: row.endsAt, status: row.status
  };
}

export class PrismaLotRepository implements ILotRepository {
  async findById(id: string): Promise<Lot | null> {
    const lot = await prisma.lot.findUnique({ where: { id } });
    return lot ? toLot(lot) : null;
  }

  async listOpen(): Promise<Lot[]> {
    const lots = await prisma.lot.findMany({ where: { status: "OPEN" }, orderBy: { endsAt: "asc" } });
    return lots.map(toLot);
  }

  async createWithSellerWallet(input: NewLot): Promise<Lot> {
    return prisma.$transaction(async (tx) => {
      await tx.wallet.upsert({ where: { userId: input.sellerId }, update: {}, create: { userId: input.sellerId } });
      const row = await tx.lot.create({ data: { ...input, types: input.types, stats: input.stats } });
      return toLot(row);
    });
  }

  async cancelOpenUnbidLot(lotId: string, sellerId: string): Promise<Lot> {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Lot" WHERE "id" = ${lotId} FOR UPDATE`;
      const lot = await tx.lot.findUnique({ where: { id: lotId } });
      if (!lot) throw new AppError("Lote não encontrado.", 404);
      if (lot.sellerId !== sellerId) throw new AppError("Só pode cancelar os seus próprios lotes.", 403);
      if (lot.status !== "OPEN") throw new AppError("Este lote não está aberto.", 409);
      if (await tx.bid.count({ where: { lotId } })) throw new AppError("Não é possível cancelar um lote que já recebeu lances.", 409);
      return toLot(await tx.lot.update({ where: { id: lotId }, data: { status: "CANCELLED" } }));
    });
  }
}
