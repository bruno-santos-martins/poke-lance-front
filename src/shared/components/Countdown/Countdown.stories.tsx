import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Countdown } from "./Countdown";

const inMilliseconds = (offset: number) => new Date(Date.now() + offset).toISOString();

const meta = {
  title: "Design System/Countdown",
  component: Countdown,
  args: { endsAt: inMilliseconds(3_600_000) },
  argTypes: {
    endsAt: { control: "text", description: "Data ISO de encerramento" },
    urgentThresholdMilliseconds: { control: { type: "number", step: 1000 } },
    expiredLabel: { control: "text" }
  }
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ticking: Story = {
  args: { endsAt: inMilliseconds(10_000) },
  play: async ({ canvasElement }) => {
    const countdown = within(canvasElement).getByText(/00:00:\d{2}/);
    const initialLabel = countdown.textContent;
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await expect(countdown.textContent).not.toBe(initialLabel);
  }
};

export const Urgent: Story = { args: { endsAt: inMilliseconds(60_000) } };

export const Expired: Story = {
  args: { endsAt: inMilliseconds(-1_000) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Encerrado")).toBeInTheDocument();
  }
};

export const CustomLabels: Story = { args: { endsAt: inMilliseconds(-1_000), expiredLabel: "Leilão encerrado" } };
export const InvalidDate: Story = { args: { endsAt: "data-invalida" } };

export const DarkMode: Story = { globals: { theme: "dark" } };
export const DarkModeUrgent: Story = { args: { endsAt: inMilliseconds(60_000) }, globals: { theme: "dark" } };
