import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { calculateRemainingMilliseconds, formatCountdown as formatCountdownLabel } from "../../utils";
import type { CountdownProps } from "./Countdown.types";
import styles from "./Countdown.module.css";

const DEFAULT_URGENT_THRESHOLD_MILLISECONDS = 120_000;

export function Countdown({
  endsAt,
  urgentThresholdMilliseconds = DEFAULT_URGENT_THRESHOLD_MILLISECONDS,
  expiredLabel = "Encerrado"
}: CountdownProps) {
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(
    () => calculateRemainingMilliseconds(endsAt, Date.now())
  );

  useEffect(() => {
    const updateRemainingTime = () => {
      setRemainingMilliseconds(calculateRemainingMilliseconds(endsAt, Date.now()));
    };

    updateRemainingTime();
    const timerId = window.setInterval(updateRemainingTime, 1000);
    return () => window.clearInterval(timerId);
  }, [endsAt]);

  const isUrgent = remainingMilliseconds > 0
    && remainingMilliseconds < urgentThresholdMilliseconds;

  return (
    <span data-cy="countdown" className={`${styles.countdown}${isUrgent ? ` ${styles.urgent}` : ""}`}>
      <Clock3 size={15} aria-hidden="true" />
      {remainingMilliseconds ? formatCountdownLabel(remainingMilliseconds) : expiredLabel}
    </span>
  );
}
