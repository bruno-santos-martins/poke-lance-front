import { ILotRepository } from "../../../core/ports/repositories";
import { IAuctionNotifier } from "../../../core/ports/services";

export class CancelLotUseCase {
  constructor(private readonly lots: ILotRepository, private readonly notifier: IAuctionNotifier) {}

  async execute(lotId: string, sellerId: string) {
    const lot = await this.lots.cancelOpenUnbidLot(lotId, sellerId);
    this.notifier.lotUpdated(lot.id, { status: lot.status });
    return lot;
  }
}
