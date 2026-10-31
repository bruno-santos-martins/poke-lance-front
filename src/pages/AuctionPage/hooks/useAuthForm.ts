import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage, request } from "../../../shared/api/request";
import type { User } from "../AuctionPage.types";
import { getAuthSchema, type AuthFormValues } from "../schemas/auth.schema";

type AuthResponse = { token: string; user: User };

type UseAuthFormOptions = {
  mode: "login" | "register";
  onAuthenticated: (result: AuthResponse) => void;
  onError: (message: string) => void;
};

export function useAuthForm({ mode, onAuthenticated, onError }: UseAuthFormOptions) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<AuthFormValues>({
    resolver: zodResolver(getAuthSchema(mode)),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", role: "BIDDER" }
  });

  useEffect(() => {
    reset({ name: "", email: "", password: "", role: "BIDDER" });
  }, [mode, reset]);

  const submit = handleSubmit(async (values) => {
    onError("");
    try {
      const result = await request<AuthResponse>(`/auth/${mode}`, undefined, {
        method: "POST",
        body: JSON.stringify(mode === "register"
          ? values
          : { email: values.email, password: values.password })
      });
      reset();
      onAuthenticated(result);
    } catch (error) {
      onError(getErrorMessage(error));
    }
  });

  return { register, handleSubmit: submit, errors, isSubmitting, isValid, reset };
}
