import { X } from "lucide-react";
import type { ModalCloseProps } from "./ModalClose.types";
import styles from "./ModalClose.module.css";

export function ModalClose({ onClose, label = "Fechar" }: ModalCloseProps) {
  return (
    <button
      className={styles.button}
      type="button"
      onClick={onClose}
      aria-label={label}
    >
      <X size={19} aria-hidden="true" />
    </button>
  );
}
