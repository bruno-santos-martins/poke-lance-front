import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Design System/Button",
  component: Button,
  args: { children: "Continuar", variant: "primary" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "danger"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true, loadingLabel: "Aguarde..." } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = { args: { children: "Remover lote", variant: "danger" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const DarkTheme: Story = {
  decorators: [(Story) => <div data-theme="dark" style={{ display: "inline-block", padding: "var(--spacing-6)", background: "var(--color-background)" }}><Story /></div>]
};
