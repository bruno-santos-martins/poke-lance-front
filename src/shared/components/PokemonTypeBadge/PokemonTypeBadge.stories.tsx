import type { Meta, StoryObj } from "@storybook/react";
import { PokemonTypeBadge } from "./PokemonTypeBadge";

const pokemonTypes = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

const meta = {
  title: "Design System/PokemonTypeBadge",
  component: PokemonTypeBadge,
  args: { type: "fire" },
  argTypes: {
    type: { control: "select", options: [...pokemonTypes, "unknown-type"] }
  }
} satisfies Meta<typeof PokemonTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Water: Story = { args: { type: "water" } };
export const Grass: Story = { args: { type: "grass" } };
export const UnknownType: Story = { args: { type: "unknown-type" } };

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)", maxWidth: "32rem" }}>
      {pokemonTypes.map((type) => <PokemonTypeBadge type={type} key={type} />)}
    </div>
  )
};

export const DarkMode: Story = { ...AllTypes, globals: { theme: "dark" } };
