"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const label = mounted
    ? theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
    : "Cambiar tema";

  return (
    <Button
      variant="ghost"
      className={
        collapsed
          ? "w-full justify-center px-2 text-muted-foreground hover:text-foreground hover:bg-accent"
          : "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
      }
      onClick={toggleTheme}
      aria-label={label}
    >
      {!mounted ? (
        <Moon className="h-4 w-4" />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      {!collapsed && (
        <span className="ml-3">
          {mounted ? (theme === "dark" ? "Modo claro" : "Modo oscuro") : "Tema"}
        </span>
      )}
    </Button>
  );
}
