import { z } from "zod";

export const createLotSchema = z.object({
  startingBid: z.number({ error: "Informe o lance inicial." }).finite().min(1, "O lance inicial mínimo é R$ 1,00."),
  increment: z.number({ error: "Informe o incremento." }).finite().min(1, "O incremento mínimo é R$ 1,00."),
  duration: z.number({ error: "Selecione a duração." }).int().refine(
    (duration) => [60, 360, 1440, 10080].includes(duration),
    "Selecione uma duração válida."
  )
});

export type CreateLotFormValues = z.infer<typeof createLotSchema>;
