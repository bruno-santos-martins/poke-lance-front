import type { ButtonProps } from "./Button.types";
import styles from "./Button.module.css";

export function Button({
  children,
  variant = "primary",
  loading = false,
  loadingLabel = "A carregar...",
  disabled,
  className,
  type = "button",
  ...buttonProps
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  return (
    <button
      {...buttonProps}
      className={classes}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
