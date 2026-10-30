import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "../../context/ThemeContext";
import { PokemonTypeBadge } from "./PokemonTypeBadge";

const meta = {
  title: "Design System/PokemonTypeBadge",
  component: PokemonTypeBadge,
  args: { type: "fire" }
} satisfies Meta<typeof PokemonTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fire: Story = {};
export const Water: Story = { args: { type: "water" } };
export const Grass: Story = { args: { type: "grass" } };
export const UnknownType: Story = { args: { type: "unknown-type" } };
export const DarkTheme: Story = {
  args: { type: "electric" },
  decorators: [(Story) => <ThemeProvider defaultTheme="dark"><Story /></ThemeProvider>]
};
