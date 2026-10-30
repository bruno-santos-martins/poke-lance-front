import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "../../context/ThemeContext";
import { Badge } from "./Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  args: { children: "Status" }
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = { args: { children: "Vencedor", tone: "success" } };
export const Warning: Story = { args: { children: "Em andamento", tone: "warning" } };
export const Danger: Story = { args: { children: "Superado", tone: "danger" } };
export const DarkTheme: Story = {
  args: { children: "Vencedor", tone: "success" },
  decorators: [(Story) => <ThemeProvider defaultTheme="dark"><Story /></ThemeProvider>]
};
