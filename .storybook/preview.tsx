import type { Preview } from "@storybook/react";
import { ThemeProvider, type ResolvedTheme } from "../src/shared/context/ThemeContext";
import "../src/shared/styles/tokens.css";
import "../src/shared/styles/typography.css";
import "../src/shared/styles/globals.css";

const preview: Preview = {
  parameters: { backgrounds: { disable: true } },
  globalTypes: {
    theme: {
      description: "Tema global dos componentes (Design Tokens de tokens.css)",
      toolbar: {
        title: "Tema",
        icon: "mirror",
        items: [
          { value: "light", title: "Light Mode", icon: "sun" },
          { value: "dark", title: "Dark Mode", icon: "moon" }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme ?? "light") as ResolvedTheme;
      // The key remounts the provider so switching the toolbar resets the theme state.
      return (
        <ThemeProvider key={theme} defaultTheme={theme}>
          <div style={{ padding: "var(--spacing-6)", background: "var(--color-background)", color: "var(--color-foreground)" }}>
            <Story />
          </div>
        </ThemeProvider>
      );
    }
  ]
};

export default preview;
