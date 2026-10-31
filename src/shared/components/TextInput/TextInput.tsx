import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./TextInput.module.css";

export type TextInputVariant = "default" | "search";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ReactNode;
  variant?: TextInputVariant;
  wrapperClassName?: string;
};

export function TextInput({
  label,
  variant = "default",
  className,
  wrapperClassName,
  id,
  ...inputProps
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const input = (
    <input
      {...inputProps}
      id={inputId}
      className={["text-input", styles.input, styles[variant], className].filter(Boolean).join(" ")}
    />
  );

  if (label === undefined) return input;

  return (
    <label className={[styles.field, wrapperClassName].filter(Boolean).join(" ")} htmlFor={inputId}>
      <span>{label}</span>
      {input}
    </label>
  );
}
