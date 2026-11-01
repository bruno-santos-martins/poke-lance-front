import { z } from "zod";
import { convertReaisToCentavos, formatCurrencyBRL } from "../../../shared/utils";

/**
 * Minimum accepted bid for a lot, in centavos: the starting bid while the lot has no bids,
 * otherwise the current bid plus the minimum increment.
 */
export function getMinimumBidInCentavos(lot: { startingBid: number; currentBid: number | null; minimumIncrement: number }): number {
  return lot.currentBid === null ? lot.startingBid : lot.currentBid + lot.minimumIncrement;
}

const MAX_REAIS = 99_999_999.99;

export function getBidSchema(minimumBidInCentavos: number) {
  return z.object({
    amount: z.number({ error: "Informe o valor do lance." })
      .finite()
      .positive("O lance deve ser maior que zero.")
      .max(MAX_REAIS, "O lance máximo é R$ 99.999.999,99.")
      .refine(
        (amount) => convertReaisToCentavos(amount) >= minimumBidInCentavos,
        `O lance mínimo é ${formatCurrencyBRL(minimumBidInCentavos)}.`
      )
  });
}

export const bidSchema = getBidSchema(0);

export type BidFormValues = z.infer<typeof bidSchema>;
