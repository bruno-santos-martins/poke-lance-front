import { z } from "zod";

const MAX_REAIS = 99_999_999.99;

export const depositSchema = z.object({
  amount: z
    .number({ error: "Informe o valor do depósito." })
    .finite()
    .min(0.01, "O depósito mínimo é R$ 0,01.")
    .max(MAX_REAIS, "O depósito máximo é R$ 99.999.999,99.")
});

export type DepositFormValues = z.infer<typeof depositSchema>;
