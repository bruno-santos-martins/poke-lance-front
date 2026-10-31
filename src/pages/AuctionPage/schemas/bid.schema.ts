import { z } from "zod";

export const bidSchema = z.object({
  amount: z.number({ error: "Informe o valor do lance." }).finite().positive("O lance deve ser maior que zero.")
});

export type BidFormValues = z.infer<typeof bidSchema>;
