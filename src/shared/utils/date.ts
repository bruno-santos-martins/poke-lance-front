/**
 * Calculates the time remaining until an auction closes.
 * @param endTimestamp ISO date string representing the closing time.
 * @param currentTimestampMilliseconds Current time in milliseconds since epoch.
 * @returns Non-negative remaining time in milliseconds; invalid timestamps return zero.
 * @example calculateRemainingMilliseconds("2026-10-30T12:00:00Z", Date.now())
 */
export function calculateRemainingMilliseconds(
  endTimestamp: string,
  currentTimestampMilliseconds: number
): number {
  const endTimeMilliseconds = Date.parse(endTimestamp);
  if (!Number.isFinite(endTimeMilliseconds) || !Number.isFinite(currentTimestampMilliseconds)) {
    return 0;
  }

  return Math.max(0, endTimeMilliseconds - currentTimestampMilliseconds);
}

/**
 * Formats a duration as a zero-padded HH:MM:SS countdown.
 * @param remainingMilliseconds Duration in milliseconds.
 * @returns Countdown label; invalid or negative durations are treated as zero.
 * @example formatCountdown(3661000) // "01:01:01"
 */
export function formatCountdown(remainingMilliseconds: number): string {
  const safeRemainingMilliseconds = Number.isFinite(remainingMilliseconds)
    ? Math.max(0, remainingMilliseconds)
    : 0;
  const remainingSeconds = Math.floor(safeRemainingMilliseconds / 1000);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return [hours, minutes, seconds]
    .map((timeUnit) => String(timeUnit).padStart(2, "0"))
    .join(":");
}
