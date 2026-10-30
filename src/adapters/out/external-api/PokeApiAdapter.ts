import axios from "axios";
import { AppError } from "../../../core/domain/errors";
import { IPokeApiProvider, PokemonCard, PokemonSuggestion } from "../../../core/ports/services";

export class PokeApiAdapter implements IPokeApiProvider {
  private pokemonIndex: Promise<PokemonSuggestion[]> | null = null;
  private pokemonIndexExpiresAt = 0;

  async searchPokemon(query: string): Promise<PokemonSuggestion[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const index = await this.getPokemonIndex();
    const matches = index.filter((pokemon) =>
      pokemon.name.startsWith(normalized) || String(pokemon.id).startsWith(normalized) || pokemon.name.includes(normalized)
    );
    matches.sort((left, right) => {
      const leftStarts = left.name.startsWith(normalized) || String(left.id).startsWith(normalized);
      const rightStarts = right.name.startsWith(normalized) || String(right.id).startsWith(normalized);
      return Number(rightStarts) - Number(leftStarts) || left.id - right.id;
    });
    return matches.slice(0, 8);
  }

  private async getPokemonIndex(): Promise<PokemonSuggestion[]> {
    if (this.pokemonIndex && Date.now() < this.pokemonIndexExpiresAt) return this.pokemonIndex;
    this.pokemonIndex = axios.get("https://pokeapi.co/api/v2/pokemon?limit=2000", { timeout: 10000 })
      .then(({ data }) => (data.results as { name: string; url: string }[]).map((pokemon) => {
        const id = Number(pokemon.url.match(/\/pokemon\/(\d+)\/?$/)?.[1]);
        if (!Number.isInteger(id) || id < 1) throw new AppError("A PokéAPI devolveu uma lista de Pokémon inválida.", 502);
        return { id, name: pokemon.name };
      }))
      .catch((error: unknown) => {
        this.pokemonIndex = null;
        if (error instanceof AppError) throw error;
        if (axios.isAxiosError(error)) throw new AppError("Não foi possível pesquisar Pokémon na PokéAPI. Tente novamente.", 502);
        throw error;
      });
    this.pokemonIndexExpiresAt = Date.now() + 10 * 60_000;
    return this.pokemonIndex;
  }

  async findPokemon(identifier: string): Promise<PokemonCard> {
    try {
      const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(identifier.toLowerCase())}`, { timeout: 8000 });
      const imageUrl = data.sprites?.other?.["official-artwork"]?.front_default;
      if (!imageUrl) throw new AppError("Este Pokémon não possui imagem oficial disponível.", 422);
      return {
        id: data.id,
        name: data.name,
        imageUrl,
        types: data.types.map((entry: { type: { name: string } }) => entry.type.name),
        height: data.height,
        weight: data.weight,
        stats: Object.fromEntries(data.stats.map((entry: { base_stat: number; stat: { name: string } }) => [entry.stat.name, entry.base_stat]))
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) throw new AppError("Pokémon não encontrado na PokéAPI.", 404);
        throw new AppError("Não foi possível consultar a PokéAPI. Tente novamente.", 502);
      }
      throw error;
    }
  }
}
