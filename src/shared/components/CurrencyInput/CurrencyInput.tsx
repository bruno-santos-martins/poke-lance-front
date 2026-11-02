import { useId } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import styles from "../TextInput/TextInput.module.css";

const MAX_DIGITS = 10;

function centavosToDisplay(centavos: number): string {
  if (!centavos) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(centavos / 100);
}

export type CurrencyInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  "aria-label"?: string;
  "data-cy"?: string;
};

export function CurrencyInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  "aria-label": ariaLabel,
  "data-cy": dataCy
}: CurrencyInputProps<T>) {
  const generatedId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const reais = typeof field.value === "number" && isFinite(field.value) ? field.value : 0;
        const centavos = Math.round(reais * 100);

        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
          const digits = e.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS);
          const parsed = parseInt(digits || "0", 10);
          field.onChange(parsed / 100);
        }

        return (
          <label className={styles.field} htmlFor={generatedId}>
            <span>{label}</span>
            <input
              id={generatedId}
              ref={field.ref}
              className={`text-input ${styles.input}`}
              type="text"
              inputMode="numeric"
              required={required}
              placeholder="0,00"
              value={centavosToDisplay(centavos)}
              onChange={handleChange}
              onBlur={field.onBlur}
              aria-label={ariaLabel}
              data-cy={dataCy}
            />
          </label>
        );
      }}
    />
  );
}
