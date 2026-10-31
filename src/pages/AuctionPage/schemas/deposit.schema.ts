import { z } from "zod";

export const depositSchema = z.object({
  amount: z.number({ error: "Informe o valor do depósito." }).finite().min(1, "O depósito mínimo é R$ 1,00.")
});

export type DepositFormValues = z.infer<typeof depositSchema>;
