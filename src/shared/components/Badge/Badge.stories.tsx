import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  args: { children: "Status", tone: "neutral", size: "default" },
  argTypes: {
    children: { control: "text" },
    tone: { control: "select", options: ["neutral", "success", "warning", "danger"] },
    size: { control: "inline-radio", options: ["default", "compact"] },
    className: { control: "text" }
  }
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = { args: { size: "compact" } };
export const Success: Story = { args: { children: "Vencedor", tone: "success" } };
export const Warning: Story = { args: { children: "Em andamento", tone: "warning" } };
export const Error: Story = { args: { children: "Superado", tone: "danger" } };

export const AllTones: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
      <Badge {...args} tone="neutral">Neutro</Badge>
      <Badge {...args} tone="success">Vencedor</Badge>
      <Badge {...args} tone="warning">Em andamento</Badge>
      <Badge {...args} tone="danger">Superado</Badge>
    </div>
  )
};

export const DarkMode: Story = { ...AllTones, globals: { theme: "dark" } };
