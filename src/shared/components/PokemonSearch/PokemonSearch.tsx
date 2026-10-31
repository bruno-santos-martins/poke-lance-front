import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PokemonTypeBadge } from "../PokemonTypeBadge";
import { TextInput } from "../TextInput";
import { formatPokemonId } from "../../utils";
import "./PokemonSearch.css";

export type PokemonSearchSuggestion = {
  id: number;
  name: string;
};

export type PokemonSearchResult = PokemonSearchSuggestion & {
  imageUrl: string;
  types: string[];
  height: number;
  weight: number;
  stats: Record<string, number>;
};

const pokemonStatLabels: Record<string, string> = {
  hp: "PV",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque especial",
  "special-defense": "Defesa especial",
  speed: "Velocidade"
};

type PokemonSearchProps<TPokemon extends PokemonSearchResult> = {
  selectedPokemon: TPokemon | null;
  searchPokemon: (query: string, signal: AbortSignal) => Promise<PokemonSearchSuggestion[]>;
  loadPokemon: (id: number, signal: AbortSignal) => Promise<TPokemon>;
  onSelectionChange: (pokemon: TPokemon | null) => void;
};

export function PokemonSearch<TPokemon extends PokemonSearchResult>({
  selectedPokemon,
  searchPokemon,
  loadPokemon,
  onSelectionChange
}: PokemonSearchProps<TPokemon>) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PokemonSearchSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const detailsRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (
      detailsLoading
      || selectedPokemon?.name === normalizedQuery.toLowerCase()
      || (normalizedQuery.length < 2 && !/^\d+$/.test(normalizedQuery))
    ) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSuggestions([]);
    setSearchCompleted(false);
    setError("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      void searchPokemon(normalizedQuery, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setActiveSuggestion(0);
          setSearchCompleted(true);
        })
        .catch((reason: Error) => {
          if (!controller.signal.aborted) {
            setError(reason.message);
            setSearchCompleted(true);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [detailsLoading, query, searchPokemon, selectedPokemon]);

  useEffect(() => () => detailsRequest.current?.abort(), []);

  function changeQuery(value: string) {
    detailsRequest.current?.abort();
    setQuery(value);
    setSuggestions([]);
    setSearchCompleted(false);
    setDetailsLoading(false);
    setError("");
    onSelectionChange(null);
  }

  async function selectPokemon(pokemon: PokemonSearchSuggestion) {
    detailsRequest.current?.abort();
    const controller = new AbortController();
    detailsRequest.current = controller;
    setQuery(pokemon.name);
    setSuggestions([]);
    setSearchCompleted(false);
    setError("");
    setDetailsLoading(true);
    onSelectionChange(null);

    try {
      const details = await loadPokemon(pokemon.id, controller.signal);
      if (!controller.signal.aborted) onSelectionChange(details);
    } catch (reason) {
      if (!controller.signal.aborted) setError((reason as Error).message);
    } finally {
      if (!controller.signal.aborted) setDetailsLoading(false);
    }
  }

  return (
    <div className="pokemon-search-field">
      <label htmlFor="pokemon-search-input">Pokémon por nome ou ID</label>
      <div className="pokemon-search">
        <TextInput
          id="pokemon-search-input"
          name="pokemon"
          className="pokemon-search-input"
          required
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls="pokemon-suggestions"
          autoComplete="off"
          placeholder="ex.: pikachu ou 25"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && suggestions.length) {
              event.preventDefault();
              setActiveSuggestion((index) => (index + 1) % suggestions.length);
            } else if (event.key === "ArrowUp" && suggestions.length) {
              event.preventDefault();
              setActiveSuggestion((index) => (index - 1 + suggestions.length) % suggestions.length);
            } else if (event.key === "Enter" && suggestions[activeSuggestion]) {
              event.preventDefault();
              void selectPokemon(suggestions[activeSuggestion]);
            } else if (event.key === "Escape") {
              setSuggestions([]);
            }
          }}
        />
        {searching && <span className="pokemon-search-status">A pesquisar...</span>}
        {suggestions.length > 0 && (
          <div className="pokemon-suggestions" id="pokemon-suggestions" role="listbox">
            {suggestions.map((pokemon, index) => (
              <button
                type="button"
                role="option"
                aria-selected={index === activeSuggestion}
                className={index === activeSuggestion ? "active" : ""}
                key={pokemon.id}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveSuggestion(index)}
                onClick={() => void selectPokemon(pokemon)}
              >
                <span className="pokemon-suggestion-id">#{formatPokemonId(pokemon.id)}</span>
                <span className="pokemon-suggestion-name">{pokemon.name}</span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        )}
        {searchCompleted && !searching && !error && !detailsLoading && !selectedPokemon && suggestions.length === 0 && (
          <div className="pokemon-suggestions pokemon-no-results">Nenhum Pokémon encontrado.</div>
        )}
      </div>
      {detailsLoading && <span className="pokemon-hint">A carregar imagem e informações do Pokémon...</span>}
      {error && <span className="pokemon-details-error">{error}</span>}
      {selectedPokemon ? (
        <>
          <span className="pokemon-selected">
            Pokémon selecionado: #{formatPokemonId(selectedPokemon.id)} · {selectedPokemon.name}
          </span>
          <section className="pokemon-preview" aria-label={`Pré-visualização de ${selectedPokemon.name}`}>
            <div className="pokemon-preview-art">
              <img src={selectedPokemon.imageUrl} alt={`Imagem de ${selectedPokemon.name}`} />
            </div>
            <div className="pokemon-preview-details">
              <span className="pokemon-preview-number">POKÉMON Nº {formatPokemonId(selectedPokemon.id)}</span>
              <h3>{selectedPokemon.name}</h3>
              <div className="pokemon-preview-types">
                {selectedPokemon.types.map((type) => <PokemonTypeBadge type={type} key={type} />)}
              </div>
              <div className="pokemon-preview-measures">
                <span><small>ALTURA</small><b>{(selectedPokemon.height / 10).toLocaleString("pt-BR")} m</b></span>
                <span><small>PESO</small><b>{(selectedPokemon.weight / 10).toLocaleString("pt-BR")} kg</b></span>
              </div>
              <div className="pokemon-preview-stats">
                {Object.entries(selectedPokemon.stats).map(([name, value]) => (
                  <span key={name}>
                    <small>{pokemonStatLabels[name] ?? name.replaceAll("-", " ")}</small>
                    <b>{value}</b>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : !detailsLoading && !error && (
        <span className="pokemon-hint">Digite pelo menos 2 letras ou um ID para pesquisar.</span>
      )}
    </div>
  );
}
