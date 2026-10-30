import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./shared/context/ThemeContext";
import "./shared/styles/tokens.css";
import "./shared/styles/typography.css";
import "./shared/styles/globals.css";
import "./shared/styles/site.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
