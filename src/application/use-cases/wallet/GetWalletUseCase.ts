import { AppError } from "../../../core/domain/errors";
import { IWalletRepository } from "../../../core/ports/repositories";

export class GetWalletUseCase {
  constructor(private readonly wallets: IWalletRepository) {}

  async execute(userId: string) {
    const wallet = await this.wallets.findByUserId(userId);
    if (!wallet) throw new AppError("Carteira não encontrada.", 404);
    return wallet;
  }
}
