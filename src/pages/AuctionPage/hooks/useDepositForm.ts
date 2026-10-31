import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage, request } from "../../../shared/api/request";
import { convertReaisToCentavos } from "../../../shared/utils";
import { depositSchema, type DepositFormValues } from "../schemas/deposit.schema";

type UseDepositFormOptions = {
  onDeposited: () => Promise<void>;
  onError: (message: string) => void;
};

export function useDepositForm({ onDeposited, onError }: UseDepositFormOptions) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    mode: "onChange",
    defaultValues: { amount: undefined }
  });

  const submit = handleSubmit(async (values) => {
    onError("");
    try {
      await request("/wallet/deposits", {
        method: "POST",
        body: JSON.stringify({ amount: convertReaisToCentavos(values.amount) })
      });
      reset();
      await onDeposited();
    } catch (error) {
      onError(getErrorMessage(error));
    }
  });

  return { register, handleSubmit: submit, errors, isSubmitting, isValid, reset };
}
