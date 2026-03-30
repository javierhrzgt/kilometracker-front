"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Fuel, Menu, Plus, Route, Wrench, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

interface BottomNavProps {
  onMenuClick: () => void;
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/refuels-history", icon: Fuel, label: "Historial" },
  ];

  const fabActions = [
    { href: "/add-route", icon: Route, label: "Nueva ruta" },
    { href: "/add-refuel", icon: Fuel, label: "Cargar combustible" },
    { href: "/add-maintenance", icon: Wrench, label: "Mantenimiento" },
    { href: "/add-expense", icon: DollarSign, label: "Nuevo gasto" },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg backdrop-blur-sm">
        <nav className="flex items-center h-16 px-2">
          {/* Left nav items */}
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

          {/* Central FAB */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setFabOpen(true)}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-depth-4 flex items-center justify-center hover:bg-primary/90 transition-colors -translate-y-3"
              aria-label="Registrar"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {/* Right: Vehículos + Menú */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors",
              pathname === "/dashboard"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs font-medium">Vehículos</span>
          </Link>

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

      {/* Action Sheet */}
      <Sheet open={fabOpen} onOpenChange={setFabOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle>Registrar</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3">
            {fabActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => {
                    setFabOpen(false);
                    router.push(action.href);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
