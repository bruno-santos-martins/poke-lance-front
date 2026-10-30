import { IPokeApiProvider } from "../../../core/ports/services";

export class SearchPokemonUseCase {
  constructor(private readonly pokeApi: IPokeApiProvider) {}

  execute(query: string) {
    return this.pokeApi.searchPokemon(query);
  }
}

