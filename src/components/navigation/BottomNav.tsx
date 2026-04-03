"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Bell, Menu, Plus, Route, Wrench, DollarSign, Fuel, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { useUpcomingCounts } from "@/hooks/useUpcomingCounts";

interface BottomNavProps {
  onMenuClick: () => void;
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);
  const { maintenanceCount, expensesCount } = useUpcomingCounts();
  const totalAlerts = maintenanceCount + expensesCount;

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/routes-history", icon: Route, label: "Rutas" },
  ];

  const fabPrimaryAction = { href: "/add-route", icon: Route, label: "Nueva ruta" };

  const fabActions = [
    { href: "/add-vehicle", icon: Car, label: "Agregar Vehículo" },
    { href: "/add-refuel", icon: Fuel, label: "Cargar combustible" },
    { href: "/add-expense", icon: DollarSign, label: "Nuevo gasto" },
    { href: "/add-maintenance", icon: Wrench, label: "Mantenimiento" },
  ];

  return (
    <>
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
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
              type="button"
              onClick={() => setFabOpen((prev) => !prev)}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-depth-4 flex items-center justify-center hover:bg-primary/90 transition-colors -translate-y-3"
              aria-label={fabOpen ? "Cerrar" : "Registrar"}
            >
              <Plus className={cn("h-6 w-6 transition-transform duration-200", fabOpen && "rotate-45")} />
            </button>
          </div>

          {/* Alertas */}
          <Link
            href="/upcoming"
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors",
              pathname.startsWith("/upcoming")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <div className="relative">
              <Bell className={cn("h-5 w-5", pathname.startsWith("/upcoming") && "stroke-[2.5]")} />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                  {totalAlerts > 9 ? "9+" : totalAlerts}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Alertas</span>
          </Link>

          {/* Menú */}
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
        <SheetContent side="bottom" className="rounded-t-2xl pb-8 bg-card">
          <SheetHeader className="mb-4">
            <SheetTitle>Registrar</SheetTitle>
          </SheetHeader>

          {/* Agregar Vehículo — acción primaria full-width */}
          <button
            type="button"
            onClick={() => { setFabOpen(false); router.push(fabPrimaryAction.href); }}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors text-left mb-4"
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <fabPrimaryAction.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">{fabPrimaryAction.label}</span>
          </button>

          {/* Acciones recurrentes — grid 2×2 */}
          <div className="grid grid-cols-2 gap-3">
            {fabActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  type="button"
                  key={action.href}
                  onClick={() => { setFabOpen(false); router.push(action.href); }}
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
