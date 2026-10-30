import { IHashService } from "../../../core/ports/services";
import { AppError } from "../../../core/domain/errors";
import { IBidRepository, ILotRepository } from "../../../core/ports/repositories";

export class ValidateAuditChainUseCase {
  constructor(
    private readonly hashService: IHashService,
    private readonly lots: ILotRepository,
    private readonly bidsRepository: IBidRepository
  ) {}

  async execute(lotId: string) {
    const lot = await this.lots.findById(lotId);
    if (!lot) throw new AppError("Lote não encontrado.", 404);
    const bids = await this.bidsRepository.listByLotId(lotId);
    let previousHash: string | null = null;
    let valid = true;
    const history = bids.map((bid, index) => {
      const expected = this.hashService.sha256(`${bid.id}${bid.lotId}${bid.bidderId}${bid.amount}${bid.createdAt.toISOString()}${previousHash ?? ""}`);
      if (bid.previousHash !== previousHash || bid.hash !== expected) valid = false;
      previousHash = bid.hash;
      return {
        sequence: index + 1,
        bidder: `Licitante #${bid.bidderId.replaceAll("-", "").slice(0, 4).toUpperCase()}`,
        amount: bid.amount,
        timestamp: bid.createdAt,
        hash: bid.hash,
        previousHash: bid.previousHash
      };
    });
    return { lotId, valid, bids: history };
  }
}
