import type { Meta, StoryObj } from "@storybook/react";
import { Countdown } from "./Countdown";

const meta = {
  title: "Design System/Countdown",
  component: Countdown,
  args: { endsAt: new Date(Date.now() + 3_600_000).toISOString() }
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Urgent: Story = {
  args: { endsAt: new Date(Date.now() + 60_000).toISOString() }
};
export const Expired: Story = {
  args: { endsAt: new Date(Date.now() - 1_000).toISOString() }
};
export const CustomLabels: Story = {
  args: {
    endsAt: new Date(Date.now() - 1_000).toISOString(),
    expiredLabel: "Leilão encerrado"
  }
};
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ display: "inline-block", padding: "var(--spacing-6)", background: "var(--color-background)" }}>
        <Story />
      </div>
    )
  ]
};
