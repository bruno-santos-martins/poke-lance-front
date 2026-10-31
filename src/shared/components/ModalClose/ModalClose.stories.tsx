import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ModalClose } from "./ModalClose";

const meta = {
  title: "Design System/ModalClose",
  component: ModalClose,
  args: { onClose: fn(), label: "Fechar" },
  argTypes: {
    label: { control: "text" },
    onClose: { action: "closed" }
  },
  render: (args) => (
    <div style={{ position: "relative", width: "20rem", height: "8rem", background: "var(--color-surface)", borderRadius: "var(--radius-md)" }}>
      <ModalClose {...args} />
    </div>
  )
} satisfies Meta<typeof ModalClose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Fechar" }));
  }
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button", { name: "Fechar" })).toHaveFocus();
  }
};

export const Active: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Fechar" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  }
};

export const CustomLabel: Story = { args: { label: "Fechar detalhes do lote" } };
export const DarkMode: Story = { globals: { theme: "dark" } };
