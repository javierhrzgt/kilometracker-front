"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import { useUser } from "@/contexts/UserContext";
import { useUpcomingCounts } from "@/hooks/useUpcomingCounts";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Route,
  Fuel,
  Wrench,
  Receipt,
  Plus,
  User,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { VehicleSwitcher } from "./VehicleSwitcher";
import { NavItem } from "./NavItem";
import { NavGroup } from "./NavGroup";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { isAdmin } = useUser();
  const { maintenanceCount, expensesCount } = useUpcomingCounts();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-60",
        className
      )}
    >
      {/* Header with Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">KM Tracker</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("h-8 w-8", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Vehicle Switcher */}
      <div className={cn("p-3", isCollapsed && "px-2")}>
        <VehicleSwitcher isCollapsed={isCollapsed} />
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {/* Dashboard */}
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />

          {/* Vehicles Group */}
          <NavGroup
            title="Vehículos"
            icon={<Car className="h-4 w-4" />}
            isCollapsed={isCollapsed}
            defaultOpen={true}
          >
            <NavItem
              href="/dashboard"
              icon={<Car className="h-4 w-4" />}
              label="Todos los vehículos"
              isCollapsed={false}
            />
            <NavItem
              href="/add-vehicle"
              icon={<Plus className="h-4 w-4" />}
              label="Agregar vehículo"
              isCollapsed={false}
            />
          </NavGroup>

          {/* Routes & Trips Group */}
          <NavGroup
            title="Rutas y Viajes"
            icon={<Route className="h-4 w-4" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              href="/routes-history"
              icon={<History className="h-4 w-4" />}
              label="Historial de rutas"
              isCollapsed={false}
            />
            <NavItem
              href="/add-route"
              icon={<Plus className="h-4 w-4" />}
              label="Agregar ruta"
              isCollapsed={false}
            />
          </NavGroup>

          {/* Fuel Management Group */}
          <NavGroup
            title="Combustible"
            icon={<Fuel className="h-4 w-4" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              href="/refuels-history"
              icon={<History className="h-4 w-4" />}
              label="Historial de recargas"
              isCollapsed={false}
            />
            <NavItem
              href="/add-refuel"
              icon={<Plus className="h-4 w-4" />}
              label="Agregar recarga"
              isCollapsed={false}
            />
            <NavItem
              href="/fuel-analysis"
              icon={<TrendingUp className="h-4 w-4" />}
              label="Análisis de consumo"
              isCollapsed={false}
            />
          </NavGroup>

          {/* Maintenance Group */}
          <NavGroup
            title="Mantenimiento"
            icon={<Wrench className="h-4 w-4" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              href="/maintenance-history"
              icon={<History className="h-4 w-4" />}
              label="Historial"
              isCollapsed={false}
            />
            <NavItem
              href="/add-maintenance"
              icon={<Plus className="h-4 w-4" />}
              label="Agregar mantenimiento"
              isCollapsed={false}
            />
            <NavItem
              href="/upcoming-maintenance"
              icon={<Calendar className="h-4 w-4" />}
              label="Próximos servicios"
              isCollapsed={false}
              badge={maintenanceCount > 0 ? maintenanceCount : undefined}
            />
          </NavGroup>

          {/* Expenses Group */}
          <NavGroup
            title="Gastos"
            icon={<Receipt className="h-4 w-4" />}
            isCollapsed={isCollapsed}
          >
            <NavItem
              href="/expenses-history"
              icon={<History className="h-4 w-4" />}
              label="Historial de gastos"
              isCollapsed={false}
            />
            <NavItem
              href="/add-expense"
              icon={<Plus className="h-4 w-4" />}
              label="Agregar gasto"
              isCollapsed={false}
            />
            <NavItem
              href="/expenses-summary"
              icon={<DollarSign className="h-4 w-4" />}
              label="Resumen de gastos"
              isCollapsed={false}
            />
            <NavItem
              href="/upcoming-expenses"
              icon={<Calendar className="h-4 w-4" />}
              label="Gastos recurrentes"
              isCollapsed={false}
              badge={expensesCount > 0 ? expensesCount : undefined}
            />
          </NavGroup>

          <Separator className="my-2" />

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                ACCIONES RÁPIDAS
              </p>
            </div>
          )}
          <NavItem
            href="/add-route"
            icon={<Plus className="h-4 w-4" />}
            label="Nueva ruta"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/add-refuel"
            icon={<Plus className="h-4 w-4" />}
            label="Nueva recarga"
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/add-expense"
            icon={<Plus className="h-4 w-4" />}
            label="Nuevo gasto"
            isCollapsed={isCollapsed}
          />

          <Separator className="my-2" />

          {/* Settings */}
          <NavItem
            href="/profile"
            icon={<User className="h-4 w-4" />}
            label="Perfil"
            isCollapsed={isCollapsed}
          />
          {isAdmin && (
            <NavItem
              href="/admin-users"
              icon={<Shield className="h-4 w-4" />}
              label="Panel de Admin"
              isCollapsed={isCollapsed}
            />
          )}
        </div>
      </ScrollArea>

      {/* Footer with Logout */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent",
            isCollapsed && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Cerrar sesión</span>}
        </Button>
      </div>
    </div>
  );
}
