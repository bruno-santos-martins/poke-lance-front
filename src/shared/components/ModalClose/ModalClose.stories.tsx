import type { Meta, StoryObj } from "@storybook/react";
import { ModalClose } from "./ModalClose";

const meta = {
  title: "Design System/ModalClose",
  component: ModalClose,
  args: { onClose: () => undefined }
} satisfies Meta<typeof ModalClose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ position: "relative", width: "20rem", height: "8rem", background: "var(--color-surface)", borderRadius: "var(--radius-md)" }}>
      <ModalClose {...args} />
    </div>
  )
};

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ display: "inline-block", padding: "var(--spacing-6)", background: "var(--color-background)" }}>
        <Story />
      </div>
    )
  ],
  render: (args) => (
    <div style={{ position: "relative", width: "20rem", height: "8rem", background: "var(--color-surface)", borderRadius: "var(--radius-md)" }}>
      <ModalClose {...args} />
    </div>
  )
};
