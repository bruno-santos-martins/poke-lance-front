import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { PokemonSearch, type PokemonSearchResult, type PokemonSearchSuggestion } from "./PokemonSearch";

const pikachu: PokemonSearchResult = {
  id: 25,
  name: "pikachu",
  imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  types: ["electric"],
  height: 4,
  weight: 60,
  stats: { hp: 35, attack: 55, defense: 40, "special-attack": 50, "special-defense": 50, speed: 90 }
};

const suggestions: PokemonSearchSuggestion[] = [
  { id: 25, name: "pikachu" },
  { id: 172, name: "pichu" }
];

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

type StoryArgs = {
  initialPokemon: PokemonSearchResult | null;
  searchPokemon: (query: string, signal: AbortSignal) => Promise<PokemonSearchSuggestion[]>;
  loadPokemon: (id: number, signal: AbortSignal) => Promise<PokemonSearchResult>;
  onSelectionChange: (pokemon: PokemonSearchResult | null) => void;
};

// PokemonSearch is controlled; this wrapper owns the selection like the create-lot form does.
function PokemonSearchHarness({ initialPokemon, onSelectionChange, ...props }: StoryArgs) {
  const [selectedPokemon, setSelectedPokemon] = useState(initialPokemon);
  return (
    <div style={{ maxWidth: "32rem" }}>
      <PokemonSearch
        {...props}
        selectedPokemon={selectedPokemon}
        onSelectionChange={(pokemon) => {
          setSelectedPokemon(pokemon);
          onSelectionChange(pokemon);
        }}
      />
    </div>
  );
}

const meta = {
  title: "Design System/PokemonSearch",
  component: PokemonSearchHarness,
  args: {
    initialPokemon: null,
    searchPokemon: fn(async () => suggestions),
    loadPokemon: fn(async () => pikachu),
    onSelectionChange: fn()
  },
  argTypes: {
    initialPokemon: { control: "object" },
    searchPokemon: { control: false },
    loadPokemon: { control: false },
    onSelectionChange: { action: "selectionChanged" }
  }
} satisfies Meta<typeof PokemonSearchHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox");
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  }
};

export const WithSuggestions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "pi");
    await expect(await canvas.findByRole("listbox")).toBeInTheDocument();
    await expect(canvas.getAllByRole("option")).toHaveLength(2);
  }
};

export const HoverSuggestion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "pi");
    const [, pichu] = await canvas.findAllByRole("option");
    await userEvent.hover(pichu);
    await expect(pichu).toHaveAttribute("aria-selected", "true");
  }
};

export const Loading: Story = {
  args: { searchPokemon: fn(() => new Promise<PokemonSearchSuggestion[]>(() => undefined)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "pika");
    await expect(await canvas.findByText("A pesquisar...")).toBeInTheDocument();
  }
};

export const LoadingDetails: Story = {
  args: { loadPokemon: fn(() => new Promise<PokemonSearchResult>(() => undefined)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "pi");
    await userEvent.click((await canvas.findAllByRole("option"))[0]);
    await expect(await canvas.findByText(/A carregar imagem/)).toBeInTheDocument();
  }
};

export const Success: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "pi");
    await userEvent.click((await canvas.findAllByRole("option"))[0]);
    await expect(await canvas.findByText(/Pokémon selecionado: #025/)).toBeInTheDocument();
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(pikachu);
  }
};

export const Selected: Story = { args: { initialPokemon: pikachu } };

export const NoResults: Story = {
  args: { searchPokemon: fn(async () => []) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "zzz");
    await expect(await canvas.findByText("Nenhum Pokémon encontrado.")).toBeInTheDocument();
  }
};

export const Error: Story = {
  args: {
    searchPokemon: fn(async () => {
      await wait(50);
      throw new globalThis.Error("Não foi possível pesquisar Pokémon na PokéAPI.");
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox"), "pika");
    await expect(await canvas.findByText(/Não foi possível pesquisar/)).toBeInTheDocument();
  }
};

export const DarkMode: Story = { globals: { theme: "dark" } };
export const DarkModeSelected: Story = { args: { initialPokemon: pikachu }, globals: { theme: "dark" } };
