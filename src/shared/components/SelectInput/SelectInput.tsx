import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import styles from "./SelectInput.module.css";

export type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  wrapperClassName?: string;
};

export function SelectInput({
  label,
  className,
  wrapperClassName,
  id,
  children,
  ...selectProps
}: SelectInputProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const select = (
    <select
      {...selectProps}
      id={selectId}
      className={["select-input", styles.select, className].filter(Boolean).join(" ")}
    >
      {children}
    </select>
  );

  if (label === undefined) return select;

  return (
    <label className={[styles.field, wrapperClassName].filter(Boolean).join(" ")} htmlFor={selectId}>
      <span>{label}</span>
      {select}
    </label>
  );
}
