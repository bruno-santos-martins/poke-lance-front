import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ThemeToggle } from "./ThemeToggle";

// The global preview decorator wraps every story in ThemeProvider, driven by the "Tema" toolbar.
const meta = {
  title: "Design System/ThemeToggle",
  component: ThemeToggle
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button"));
  }
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button")).toHaveFocus();
  }
};

export const SwitchesToDark: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Ativar tema escuro" }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    await expect(within(canvasElement).getByRole("button")).toHaveAccessibleName("Ativar tema claro");
  }
};

export const DarkMode: Story = { globals: { theme: "dark" } };
