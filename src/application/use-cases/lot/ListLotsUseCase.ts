import { ILotListingRepository } from "../../../core/ports/repositories";

export class ListLotsUseCase {
  constructor(private readonly lots: ILotListingRepository) {}

  execute(status?: "OPEN" | "CLOSED" | "CANCELLED") {
    return this.lots.list(status);
  }
}
