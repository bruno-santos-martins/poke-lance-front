import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "../../components";
import { ThemeProvider } from "../../context/ThemeContext";
import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  args: {
    brandHref: "/",
    navigationItems: [
      { label: "Vitrine", href: "/" },
      { label: "Como funciona", href: "/como-funciona" }
    ],
    actions: (
      <>
        <ThemeToggle />
        <a className="button button-outline button-small" href="/">
          <ArrowRight size={15} /> Ir para a vitrine
        </a>
      </>
    )
  }
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [(Story) => <ThemeProvider defaultTheme="light"><Story /></ThemeProvider>]
};
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark">
        <Story />
      </ThemeProvider>
    )
  ]
};
