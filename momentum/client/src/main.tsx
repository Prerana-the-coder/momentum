import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "@/app-router";
import { ThemeProvider } from "@/components/theme-provider";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
);
