import type { Preview } from "@storybook/react";
import "../src/shared/styles/tokens.css";
import "../src/shared/styles/globals.css";

const preview: Preview = {
  parameters: { backgrounds: { disable: true } }
};

export default preview;
