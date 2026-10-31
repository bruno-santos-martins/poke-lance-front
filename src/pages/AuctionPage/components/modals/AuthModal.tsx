import type { FormEventHandler } from "react";
import { ArrowRight } from "lucide-react";
import { ModalClose, SelectInput, TextInput } from "../../../../shared/components";

type AuthModalProps = {
  mode: "login" | "register";
  busy: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onToggleMode: () => void;
};

export function AuthModal({ mode, busy, onClose, onSubmit, onToggleMode }: AuthModalProps) {
  const isLogin = mode === "login";

  return (
    <div className="modal auth-modal">
      <ModalClose onClose={onClose} />
      <div className="modal-kicker">BEM-VINDO À POKÉLANCE</div>
      <h2>{isLogin ? "Entra na disputa." : "Cria a tua conta."}</h2>
      <p>Acompanha os lotes, faz lances e começa a tua coleção.</p>
      <form onSubmit={onSubmit} className="form-stack">
        {!isLogin && (
          <>
            <TextInput label="Nome completo" name="name" required minLength={2} placeholder="Como te chamamos?" />
            <SelectInput label="Perfil" name="role">
              <option value="BIDDER">Licitante</option>
              <option value="AUCTIONEER">Leiloeiro</option>
            </SelectInput>
          </>
        )}
        <TextInput label="E-mail" name="email" type="email" required placeholder="tu@email.com" />
        <TextInput label="Senha" name="password" type="password" required minLength={8} placeholder="Mínimo de 8 caracteres" />
        <button className="button button-primary full-button" disabled={busy}>
          {busy ? "Aguarda..." : isLogin ? "Entrar" : "Criar conta"} <ArrowRight size={16} />
        </button>
      </form>
      <div className="modal-switch">
        {isLogin ? "Ainda não tens conta?" : "Já tens uma conta?"}{" "}
        <button type="button" onClick={onToggleMode}>{isLogin ? "Regista-te" : "Entrar"}</button>
      </div>
    </div>
  );
}
