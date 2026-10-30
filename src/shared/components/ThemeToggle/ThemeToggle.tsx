import { Moon, Sun } from "lucide-react";
import { Button } from "../Button";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const nextTheme = isDarkMode ? "light" : "dark";
  const currentThemeLabel = theme === "system"
    ? `automático (${isDarkMode ? "escuro" : "claro"})`
    : isDarkMode ? "escuro" : "claro";
  const ThemeIcon = isDarkMode ? Moon : Sun;

  return (
    <Button
      variant="secondary"
      className="theme-toggle"
      aria-label={`Ativar tema ${nextTheme === "dark" ? "escuro" : "claro"}`}
      title={`Tema atual: ${currentThemeLabel}`}
      onClick={() => setTheme(nextTheme)}
    >
      <ThemeIcon size={16} />
    </Button>
  );
}
