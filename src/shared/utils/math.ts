/**
 * Converts a BRL amount in reais to integer centavos using standard rounding.
 * @param amountInReais Amount expressed in reais.
 * @returns Rounded amount in centavos.
 * @throws RangeError when the amount is not a finite number.
 * @example convertReaisToCentavos(12.5) // 1250
 */
export function convertReaisToCentavos(amountInReais: number): number {
  if (!Number.isFinite(amountInReais)) {
    throw new RangeError("O valor monetário deve ser um número finito.");
  }

  return Math.round(amountInReais * 100);
}
