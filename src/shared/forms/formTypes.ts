import type { FormEventHandler } from "react";
import type { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

export type FormController<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isValid: boolean;
};
