import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { TextInput } from "./TextInput";

const meta = {
  title: "Design System/TextInput",
  component: TextInput,
  args: { label: "O teu lance (R$)", placeholder: "mín. 10", type: "number" },
  argTypes: {
    label: { control: "text" },
    variant: { control: "select", options: ["default", "search"] },
    type: { control: "select", options: ["text", "number", "email", "password"] },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    readOnly: { control: "boolean" }
  }
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutLabel: Story = { args: { label: undefined, "aria-label": "Valor do lance" } };
export const Search: Story = {
  args: { label: undefined, variant: "search", type: "text", placeholder: "Pesquisar Pokémon...", "aria-label": "Pesquisar Pokémon" }
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("spinbutton"));
  }
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  }
};

export const Filled: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await userEvent.type(input, "125.50");
    await expect(input).toHaveValue(125.5);
  }
};

export const Disabled: Story = {
  args: { disabled: true, value: 100, readOnly: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("spinbutton")).toBeDisabled();
  }
};

export const Error: Story = {
  args: { "aria-invalid": true, "aria-describedby": "amount-error", defaultValue: 5 },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--spacing-2)", maxWidth: "20rem" }}>
      <TextInput {...args} />
      <small id="amount-error" role="alert" style={{ color: "var(--color-status-danger-foreground)" }}>
        O lance mínimo é R$ 10,00.
      </small>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("O lance mínimo");
  }
};

export const Success: Story = {
  args: { defaultValue: 150, "aria-describedby": "amount-ok" },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--spacing-2)", maxWidth: "20rem" }}>
      <TextInput {...args} />
      <small id="amount-ok" role="status" style={{ color: "var(--color-status-success-foreground)" }}>Valor válido.</small>
    </div>
  )
};

export const DarkMode: Story = { globals: { theme: "dark" } };
export const DarkModeSearch: Story = { ...Search, globals: { theme: "dark" } };
