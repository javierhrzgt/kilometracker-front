"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Route, Fuel, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  onMenuClick: () => void;
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/add-route",
      icon: Route,
      label: "Nueva Ruta",
    },
    {
      href: "/add-refuel",
      icon: Fuel,
      label: "Recarga",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg backdrop-blur-sm">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu Button */}
        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs font-medium">Menú</span>
        </Button>
      </nav>
    </div>
  );
}
