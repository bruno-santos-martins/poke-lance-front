import { IWalletRepository } from "../../../core/ports/repositories";

export class DepositBalanceUseCase {
  constructor(private readonly wallets: IWalletRepository) {}

  execute(userId: string, amount: number) {
    return this.wallets.deposit(userId, amount);
  }
}
