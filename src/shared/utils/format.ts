const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

/**
 * Formats an amount expressed in Brazilian centavos as BRL.
 * @param amountInCents Amount in the smallest BRL currency unit.
 * @returns Formatted BRL amount, or an em dash when the value is invalid.
 * @example formatCurrencyBRL(1250) // "R$ 12,50"
 */
export function formatCurrencyBRL(amountInCents: number | null | undefined): string {
  if (typeof amountInCents !== "number" || !Number.isFinite(amountInCents)) {
    return "—";
  }

  return brlFormatter.format(amountInCents / 100);
}

/**
 * Formats a Pokémon ID with at least three digits.
 * @param pokemonId Numeric ID returned for a Pokémon.
 * @returns Zero-padded ID, or an em dash when the value is invalid.
 * @example formatPokemonId(25) // "025"
 */
export function formatPokemonId(pokemonId: number): string {
  if (!Number.isSafeInteger(pokemonId) || pokemonId < 0) {
    return "—";
  }

  return String(pokemonId).padStart(3, "0");
}

/**
 * Formats a date using the application's Brazilian Portuguese locale.
 * @param value Date string, Date object, or an absent value.
 * @param fallback Text returned when the date is absent or invalid.
 * @returns Localized date, or the supplied fallback.
 * @example formatDate("2026-10-30T12:00:00.000Z", "Sem data")
 */
export function formatDate(
  value: string | Date | null | undefined,
  fallback = ""
): string {
  const date = toValidDate(value);
  return date ? date.toLocaleDateString("pt-BR") : fallback;
}

/**
 * Formats a date and time using the application's Brazilian Portuguese locale.
 * @param value Date string, Date object, or an absent value.
 * @param fallback Text returned when the date is absent or invalid.
 * @returns Localized date and time, or the supplied fallback.
 * @example formatDateTime("2026-10-30T12:00:00.000Z", "Data indisponível")
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  fallback = ""
): string {
  const date = toValidDate(value);
  return date ? date.toLocaleString("pt-BR") : fallback;
}

/**
 * Parses a date value and rejects invalid timestamps.
 * @param value Date string, Date object, or an absent value.
 * @returns A valid Date instance, or null when the input is absent or invalid.
 * @example toValidDate("2026-10-30T12:00:00.000Z")
 */
function toValidDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
