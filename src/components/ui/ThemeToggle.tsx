"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className={
        collapsed
          ? "w-full justify-center px-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          : "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
      }
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      {!collapsed && (
        <span className="ml-3">
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </span>
      )}
    </Button>
  );
}
