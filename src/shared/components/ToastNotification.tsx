import { X } from "lucide-react";
import "./ToastNotification.css";

type ToastNotificationProps = {
  message: string;
  variant: "success" | "error";
  onDismiss: () => void;
};

export function ToastNotification({ message, variant, onDismiss }: ToastNotificationProps) {
  return (
    <div data-cy="toast" className={`toast ${variant === "error" ? "toast-error" : ""}`} role={variant === "error" ? "alert" : "status"}>
      <span>{message}</span>
      <button type="button" aria-label="Dispensar notificação" onClick={onDismiss}>
        <X size={15} />
      </button>
    </div>
  );
}
