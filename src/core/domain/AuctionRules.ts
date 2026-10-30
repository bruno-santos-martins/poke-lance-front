export function minimumBid(currentBid: number | null, startingBid: number, increment: number): number {
  return currentBid === null ? startingBid : currentBid + increment;
}

export function isAntiSnipingWindow(endsAt: Date, now: Date): boolean {
  const remaining = endsAt.getTime() - now.getTime();
  return remaining >= 0 && remaining <= 120_000;
}

export function availableBalance(balance: number, committed: number): number {
  return balance - committed;
}
