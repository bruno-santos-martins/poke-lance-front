import { ArrowRight } from "lucide-react";
import { ModalClose, PokemonSearch, SelectInput, TextInput } from "../../../../shared/components";
import type { FormController } from "../../../../shared/forms/formTypes";
import type { PokemonPreview, PokemonSuggestion } from "../../AuctionPage.types";
import type { CreateLotFormValues } from "../../schemas/createLot.schema";

type CreateLotModalProps = {
  form: FormController<CreateLotFormValues>;
  selectedPokemon: PokemonPreview | null;
  searchPokemon: (query: string, signal: AbortSignal) => Promise<PokemonSuggestion[]>;
  loadPokemon: (id: number, signal: AbortSignal) => Promise<PokemonPreview>;
  onClose: () => void;
  onPokemonSelectionChange: (pokemon: PokemonPreview | null) => void;
};

export function CreateLotModal({
  form,
  selectedPokemon,
  searchPokemon,
  loadPokemon,
  onClose,
  onPokemonSelectionChange
}: CreateLotModalProps) {
  return (
    <div className="modal">
      <ModalClose onClose={onClose} />
      <div className="modal-kicker">NOVO LEILÃO</div>
      <h2>Coloca uma carta na vitrine.</h2>
      <p>A imagem oficial será descarregada e guardada no servidor no momento da criação.</p>
      <form className="form-stack" onSubmit={form.handleSubmit}>
        <PokemonSearch
          selectedPokemon={selectedPokemon}
          searchPokemon={searchPokemon}
          loadPokemon={loadPokemon}
          onSelectionChange={onPokemonSelectionChange}
        />
        <div className="form-row">
          <TextInput label="Lance inicial (R$)" {...form.register("startingBid", { valueAsNumber: true })} type="number" min="1" step="0.01" required placeholder="10.00" />
          <TextInput label="Incremento (R$)" {...form.register("increment", { valueAsNumber: true })} type="number" min="1" step="0.01" required />
        </div>
        {form.errors.startingBid?.message && <small role="alert">{String(form.errors.startingBid.message)}</small>}
        {form.errors.increment?.message && <small role="alert">{String(form.errors.increment.message)}</small>}
        <SelectInput label="Duração do leilão" {...form.register("duration", { valueAsNumber: true })}>
          <option value="60">1 hora</option>
          <option value="360">6 horas</option>
          <option value="1440">24 horas</option>
          <option value="10080">7 dias</option>
        </SelectInput>
        <button className="button button-primary full-button" disabled={form.isSubmitting || !form.isValid || !selectedPokemon}>
          {form.isSubmitting ? "A guardar..." : "Criar lote"} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
