import type { Meta, StoryObj } from "@storybook/react";
import { SiteFooter } from "./SiteFooter";

const meta = {
  title: "Layout/SiteFooter",
  component: SiteFooter,
  args: {
    brandHref: "/",
    copyrightMessage: "Feito para quem coleciona com paixão. © 2025 PokéLance.",
    integrityLabel: "Integridade verificável"
  }
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark">
        <Story />
      </div>
    )
  ]
};
