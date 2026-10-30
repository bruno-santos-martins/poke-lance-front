import { IBidderReportRepository } from "../../../core/ports/repositories";

export class GetBidderReportUseCase {
  constructor(private readonly reports: IBidderReportRepository) {}

  execute(bidderId: string) {
    return this.reports.getForBidder(bidderId);
  }
}
