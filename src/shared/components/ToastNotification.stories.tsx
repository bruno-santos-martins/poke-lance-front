import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ToastNotification } from "./ToastNotification";

const meta = {
  title: "Design System/ToastNotification",
  component: ToastNotification,
  args: { message: "Lance registado e saldo comprometido.", variant: "success", onDismiss: fn() },
  argTypes: {
    message: { control: "text" },
    variant: { control: "inline-radio", options: ["success", "error"] },
    onDismiss: { action: "dismissed" }
  },
  // The toast is position: fixed; give it room inside the docs canvas.
  decorators: [(Story) => <div style={{ minHeight: "8rem" }}><Story /></div>]
} satisfies Meta<typeof ToastNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent("Lance registado");
  }
};

export const Error: Story = {
  args: { message: "O lance deve ser maior que o lance atual.", variant: "error" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toBeInTheDocument();
  }
};

export const DismissHover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Dispensar notificação" }));
  }
};

export const DismissFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button", { name: "Dispensar notificação" })).toHaveFocus();
  }
};

export const Dismissed: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Dispensar notificação" }));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  }
};

export const DarkModeSuccess: Story = { globals: { theme: "dark" } };
export const DarkModeError: Story = { ...Error, globals: { theme: "dark" } };
