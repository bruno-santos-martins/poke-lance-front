import type { FormEventHandler } from "react";
import type { Control, FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

export type FormController<T extends FieldValues> = {
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isValid: boolean;
};
