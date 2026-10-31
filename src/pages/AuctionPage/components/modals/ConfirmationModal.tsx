import { useId, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

type ConfirmationModalProps = {
  kicker: string;
  title: ReactNode;
  description: ReactNode;
  icon: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  kicker,
  title,
  description,
  icon,
  cancelLabel,
  confirmLabel,
  pendingLabel,
  isPending,
  onCancel,
  onConfirm
}: ConfirmationModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isPending) onCancel();
  }

  return (
    <div className="modal-backdrop confirmation-backdrop" onMouseDown={handleBackdropMouseDown}>
      <section
        className="modal confirmation-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button
          type="button"
          className="confirmation-close"
          aria-label="Fechar confirmação"
          disabled={isPending}
          onClick={onCancel}
        >
          <X size={18} />
        </button>
        <div className="confirmation-icon">{icon}</div>
        <div className="modal-kicker">{kicker}</div>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="confirmation-actions">
          <button type="button" className="button button-outline" disabled={isPending} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="button confirmation-confirm"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
