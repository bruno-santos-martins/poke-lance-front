import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { SelectInput } from "./SelectInput";

const durationOptions = (
  <>
    <option value="60">1 hora</option>
    <option value="360">6 horas</option>
    <option value="1440">1 dia</option>
    <option value="10080">7 dias</option>
  </>
);

const meta = {
  title: "Design System/SelectInput",
  component: SelectInput,
  args: { label: "Duração", children: durationOptions, defaultValue: "60" },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    children: { control: false }
  }
} satisfies Meta<typeof SelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutLabel: Story = { args: { label: undefined, "aria-label": "Duração" } };

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("combobox"));
  }
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("combobox")).toHaveFocus();
  }
};

export const Selected: Story = {
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole("combobox");
    await userEvent.selectOptions(select, "1440");
    await expect(select).toHaveValue("1440");
  }
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox")).toBeDisabled();
  }
};

export const Error: Story = {
  args: { "aria-invalid": true, "aria-describedby": "duration-error", defaultValue: "" },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--spacing-2)", maxWidth: "20rem" }}>
      <SelectInput {...args}>
        <option value="" disabled>Selecione...</option>
        {durationOptions}
      </SelectInput>
      <small id="duration-error" role="alert" style={{ color: "var(--color-status-danger-foreground)" }}>Selecione uma duração válida.</small>
    </div>
  )
};

export const DarkMode: Story = { globals: { theme: "dark" } };
