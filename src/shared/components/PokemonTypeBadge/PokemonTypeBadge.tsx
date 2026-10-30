import { Badge } from "../Badge";
import styles from "./PokemonTypeBadge.module.css";

const pokemonTypeLabels: Record<string, string> = {
  electric: "Elétrico",
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  bug: "Inseto",
  normal: "Normal",
  poison: "Veneno",
  ground: "Terra",
  fairy: "Fada",
  fighting: "Lutador",
  psychic: "Psíquico",
  rock: "Pedra",
  ghost: "Fantasma",
  ice: "Gelo",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  flying: "Voador"
};

export function PokemonTypeBadge({ type }: { type: string }) {
  const typeClass = styles[type] ?? styles.neutral;

  return (
    <Badge size="compact" className={`${styles.pokemonType} ${typeClass}`}>
      {pokemonTypeLabels[type] ?? type}
    </Badge>
  );
}
