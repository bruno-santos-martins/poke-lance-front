import { ILocalStorageService, IPokeApiProvider } from "../../../core/ports/services";
import { ILotRepository } from "../../../core/ports/repositories";

type CreateLotInput = {
  sellerId: string;
  pokemon: string;
  startingBid: number;
  minimumIncrement: number;
  durationMinutes: number;
};

export class CreateLotUseCase {
  constructor(
    private readonly pokeApi: IPokeApiProvider,
    private readonly storage: ILocalStorageService,
    private readonly lots: ILotRepository
  ) {}

  async execute(input: CreateLotInput) {
    const pokemon = await this.pokeApi.findPokemon(input.pokemon);
    const imagePath = await this.storage.saveImage(pokemon.imageUrl, pokemon.id);
    return this.lots.createWithSellerWallet({
      sellerId: input.sellerId,
      pokemonId: pokemon.id,
      title: pokemon.name.replace(/(^|-)\w/g, (letter) => letter.toUpperCase()),
      imagePath,
      types: pokemon.types,
      height: pokemon.height,
      weight: pokemon.weight,
      stats: pokemon.stats,
      startingBid: input.startingBid,
      minimumIncrement: input.minimumIncrement,
      endsAt: new Date(Date.now() + input.durationMinutes * 60_000)
    });
  }
}
