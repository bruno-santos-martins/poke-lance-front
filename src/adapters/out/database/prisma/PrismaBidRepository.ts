import { prisma } from "./client";
import { IBidRepository } from "../../../../core/ports/repositories";
import { Bid } from "../../../../core/domain/entities";

export class PrismaBidRepository implements IBidRepository {
  listByLotId(lotId: string): Promise<Bid[]> {
    return prisma.bid.findMany({ where: { lotId }, orderBy: { sequence: "asc" } });
  }
}
