import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  size?: "default" | "compact";
  className?: string;
};

export function Badge({ children, tone = "neutral", size = "default", className }: BadgeProps) {
  const badgeClasses = [styles.badge, styles[tone], styles[size], className].filter(Boolean).join(" ");

  return <span className={badgeClasses}>{children}</span>;
}
