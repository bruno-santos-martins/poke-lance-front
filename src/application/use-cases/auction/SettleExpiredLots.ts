import { ISettlementRepository } from "../../../core/ports/repositories";
import { IAuctionNotifier } from "../../../core/ports/services";

export class SettleExpiredLots {
  constructor(private readonly settlements: ISettlementRepository, private readonly notifier: IAuctionNotifier) {}

  async execute(): Promise<void> {
    const settledLots = await this.settlements.settleExpired();
    for (const settled of settledLots) {
      this.notifier.lotUpdated(settled.id, { status: "CLOSED", settledAt: settled.settledAt });
      if (settled.winnerWallet && settled.winnerId) this.notifier.walletUpdated(settled.winnerId, {
        balance: settled.winnerWallet.balance,
        committed: settled.winnerWallet.committed,
        available: settled.winnerWallet.balance - settled.winnerWallet.committed
      });
      if (settled.sellerWallet) this.notifier.walletUpdated(settled.sellerId, {
        balance: settled.sellerWallet.balance,
        committed: settled.sellerWallet.committed,
        available: settled.sellerWallet.balance - settled.sellerWallet.committed
      });
    }
  }
}
