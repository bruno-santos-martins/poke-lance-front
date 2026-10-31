import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Design System/Button",
  component: Button,
  args: { children: "Continuar", variant: "primary", onClick: fn() },
  argTypes: {
    children: { control: "text" },
    variant: { control: "select", options: ["primary", "secondary", "danger"] },
    loading: { control: "boolean" },
    loadingLabel: { control: "text" },
    disabled: { control: "boolean" },
    type: { control: "select", options: ["button", "submit", "reset"] },
    onClick: { action: "clicked" }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };

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

export const Active: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  }
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  }
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Aguarde..." },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toHaveTextContent("Aguarde...");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toBeDisabled();
  }
};

export const Error: Story = { args: { children: "Remover lote", variant: "danger" } };
export const Success: Story = { args: { children: "Lance confirmado", variant: "primary" } };

export const DarkMode: Story = { globals: { theme: "dark" } };
export const DarkModeDanger: Story = { args: { children: "Remover lote", variant: "danger" }, globals: { theme: "dark" } };
