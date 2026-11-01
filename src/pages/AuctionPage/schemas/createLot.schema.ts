import { z } from "zod";

const MAX_REAIS = 99_999_999.99;

export const createLotSchema = z.object({
  startingBid: z
    .number({ error: "Informe o lance inicial." })
    .finite()
    .min(0.01, "O lance inicial mínimo é R$ 0,01.")
    .max(MAX_REAIS, "O lance inicial máximo é R$ 99.999.999,99."),
  increment: z
    .number({ error: "Informe o incremento." })
    .finite()
    .min(0.01, "O incremento mínimo é R$ 0,01.")
    .max(MAX_REAIS, "O incremento máximo é R$ 99.999.999,99."),
  duration: z.number({ error: "Selecione a duração." }).int().refine(
    (duration) => [60, 360, 1440, 10080].includes(duration),
    "Selecione uma duração válida."
  )
});

export type CreateLotFormValues = z.infer<typeof createLotSchema>;
