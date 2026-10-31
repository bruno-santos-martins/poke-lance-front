import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage, request } from "../../../shared/api/request";
import { convertReaisToCentavos } from "../../../shared/utils";
import type { PokemonPreview } from "../AuctionPage.types";
import { createLotSchema, type CreateLotFormValues } from "../schemas/createLot.schema";

type UseCreateLotFormOptions = {
  token: string;
  pokemon: PokemonPreview | null;
  onCreated: () => void;
  onError: (message: string) => void;
};

export function useCreateLotForm({ token, pokemon, onCreated, onError }: UseCreateLotFormOptions) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<CreateLotFormValues>({
    resolver: zodResolver(createLotSchema),
    mode: "onChange",
    defaultValues: { startingBid: undefined, increment: 1, duration: 60 }
  });

  const submit = handleSubmit(async (values) => {
    onError("");
    if (!pokemon) {
      onError("Escolha um Pokémon na lista de sugestões.");
      return;
    }
    try {
      await request("/lots", token, {
        method: "POST",
        body: JSON.stringify({
          pokemon: String(pokemon.id),
          startingBid: convertReaisToCentavos(values.startingBid),
          minimumIncrement: convertReaisToCentavos(values.increment),
          durationMinutes: values.duration
        })
      });
      reset({ startingBid: undefined, increment: 1, duration: 60 });
      onCreated();
    } catch (error) {
      onError(getErrorMessage(error));
    }
  });

  return { register, handleSubmit: submit, errors, isSubmitting, isValid, reset };
}
