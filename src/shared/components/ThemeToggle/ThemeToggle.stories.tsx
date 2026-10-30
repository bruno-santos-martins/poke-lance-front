import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "../../context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

const meta = {
  title: "Design System/ThemeToggle",
  component: ThemeToggle,
  parameters: { backgrounds: { disable: true } }
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [(Story) => <ThemeProvider defaultTheme="light"><Story /></ThemeProvider>]
};
export const DarkTheme: Story = {
  decorators: [(Story) => <ThemeProvider defaultTheme="dark"><Story /></ThemeProvider>]
};
