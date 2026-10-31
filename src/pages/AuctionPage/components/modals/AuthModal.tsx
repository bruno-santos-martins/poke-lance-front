import { ArrowRight } from "lucide-react";
import { ModalClose, SelectInput, TextInput } from "../../../../shared/components";
import type { FormController } from "../../../../shared/forms/formTypes";
import type { AuthFormValues } from "../../schemas/auth.schema";

type AuthModalProps = {
  mode: "login" | "register";
  form: FormController<AuthFormValues>;
  onClose: () => void;
  onToggleMode: () => void;
};

export function AuthModal({ mode, form, onClose, onToggleMode }: AuthModalProps) {
  const isLogin = mode === "login";

  return (
    <div className="modal auth-modal">
      <ModalClose onClose={onClose} />
      <div className="modal-kicker">BEM-VINDO À POKÉLANCE</div>
      <h2>{isLogin ? "Entra na disputa." : "Cria a tua conta."}</h2>
      <p>Acompanha os lotes, faz lances e começa a tua coleção.</p>
      <form onSubmit={form.handleSubmit} className="form-stack">
        {!isLogin && (
          <>
            <TextInput label="Nome completo" {...form.register("name")} required minLength={2} placeholder="Como te chamamos?" />
            {form.errors.name?.message && <small role="alert">{String(form.errors.name.message)}</small>}
            <SelectInput label="Perfil" {...form.register("role")}>
              <option value="BIDDER">Licitante</option>
              <option value="AUCTIONEER">Leiloeiro</option>
            </SelectInput>
          </>
        )}
        <TextInput label="E-mail" {...form.register("email")} type="email" required placeholder="tu@email.com" />
        {form.errors.email?.message && <small role="alert">{String(form.errors.email.message)}</small>}
        <TextInput label="Senha" {...form.register("password")} type="password" required minLength={8} placeholder="Mínimo de 8 caracteres" />
        {form.errors.password?.message && <small role="alert">{String(form.errors.password.message)}</small>}
        <button className="button button-primary full-button" disabled={form.isSubmitting || !form.isValid}>
          {form.isSubmitting ? "Aguarda..." : isLogin ? "Entrar" : "Criar conta"} <ArrowRight size={16} />
        </button>
      </form>
      <div className="modal-switch">
        {isLogin ? "Ainda não tens conta?" : "Já tens uma conta?"}{" "}
        <button type="button" onClick={onToggleMode}>{isLogin ? "Regista-te" : "Entrar"}</button>
      </div>
    </div>
  );
}
