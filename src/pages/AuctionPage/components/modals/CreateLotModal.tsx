import type { FormEventHandler } from "react";
import { ArrowRight } from "lucide-react";
import { ModalClose, PokemonSearch, SelectInput, TextInput } from "../../../../shared/components";
import type { PokemonPreview, PokemonSuggestion } from "../../AuctionPage.types";

type CreateLotModalProps = {
  busy: boolean;
  selectedPokemon: PokemonPreview | null;
  searchPokemon: (query: string, signal: AbortSignal) => Promise<PokemonSuggestion[]>;
  loadPokemon: (id: number, signal: AbortSignal) => Promise<PokemonPreview>;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onPokemonSelectionChange: (pokemon: PokemonPreview | null) => void;
};

export function CreateLotModal({
  busy,
  selectedPokemon,
  searchPokemon,
  loadPokemon,
  onClose,
  onSubmit,
  onPokemonSelectionChange
}: CreateLotModalProps) {
  return (
    <div className="modal">
      <ModalClose onClose={onClose} />
      <div className="modal-kicker">NOVO LEILÃO</div>
      <h2>Coloca uma carta na vitrine.</h2>
      <p>A imagem oficial será descarregada e guardada no servidor no momento da criação.</p>
      <form className="form-stack" onSubmit={onSubmit}>
        <PokemonSearch
          selectedPokemon={selectedPokemon}
          searchPokemon={searchPokemon}
          loadPokemon={loadPokemon}
          onSelectionChange={onPokemonSelectionChange}
        />
        <div className="form-row">
          <TextInput label="Lance inicial (R$)" name="startingBid" type="number" min="1" step="0.01" required placeholder="10.00" />
          <TextInput label="Incremento (R$)" name="increment" type="number" min="1" step="0.01" defaultValue="1.00" required />
        </div>
        <SelectInput label="Duração do leilão" name="duration">
          <option value="60">1 hora</option>
          <option value="360">6 horas</option>
          <option value="1440">24 horas</option>
          <option value="10080">7 dias</option>
        </SelectInput>
        <button className="button button-primary full-button" disabled={busy || !selectedPokemon}>
          {busy ? "A guardar..." : "Criar lote"} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
