import type { Meta, StoryObj } from "@storybook/react";
import { BrandLockup } from "./BrandLockup";

const meta = {
  title: "Layout/BrandLockup",
  component: BrandLockup,
  args: { href: "/", showTagline: true }
} satisfies Meta<typeof BrandLockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {};
export const Compact: Story = { args: { showTagline: false, iconSize: 18 } };
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ display: "inline-block", padding: "var(--spacing-4)", background: "var(--color-background)" }}>
        <Story />
      </div>
    )
  ]
};
