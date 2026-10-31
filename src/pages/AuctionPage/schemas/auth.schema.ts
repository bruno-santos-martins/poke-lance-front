import { z } from "zod";

const authFormSchema = z.object({
  name: z.string().optional(),
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  role: z.enum(["BIDDER", "AUCTIONEER"])
});

export type AuthFormValues = z.infer<typeof authFormSchema>;

export function getAuthSchema(mode: "login" | "register") {
  return authFormSchema.superRefine((values, context) => {
    if (mode === "register" && (!values.name || values.name.trim().length < 2)) {
      context.addIssue({
        code: "custom",
        message: "Informe um nome com pelo menos 2 caracteres.",
        path: ["name"]
      });
    }
  });
}
