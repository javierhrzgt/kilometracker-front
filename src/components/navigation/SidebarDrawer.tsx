"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useUpcomingCounts } from "@/hooks/useUpcomingCounts";
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
  History,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { VehicleSwitcher } from "./VehicleSwitcher";
import { NavItem } from "./NavItem";
import { NavGroup } from "./NavGroup";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const router = useRouter();
  const { isAdmin } = useUser();
  const { maintenanceCount, expensesCount } = useUpcomingCounts();

  const handleNavClick = () => {
    // Close drawer when navigation item is clicked
    onClose();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">KM Tracker</span>
          </SheetTitle>
        </SheetHeader>

        {/* Vehicle Switcher */}
        <div className="p-3">
          <VehicleSwitcher isCollapsed={false} />
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 h-[calc(100vh-200px)] px-3 py-2">
          <div className="space-y-1">
            {/* Dashboard */}
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              onClick={handleNavClick}
            />

            {/* Vehicles Group */}
            <NavGroup
              title="Vehículos"
              icon={<Car className="h-4 w-4" />}
              defaultOpen={true}
            >
              <NavItem
                href="/dashboard"
                icon={<Car className="h-4 w-4" />}
                label="Todos los vehículos"
                onClick={handleNavClick}
              />
              <NavItem
                href="/add-vehicle"
                icon={<Plus className="h-4 w-4" />}
                label="Agregar vehículo"
                onClick={handleNavClick}
              />
            </NavGroup>

            {/* Routes & Trips Group */}
            <NavGroup
              title="Rutas y Viajes"
              icon={<Route className="h-4 w-4" />}
            >
              <NavItem
                href="/routes-history"
                icon={<History className="h-4 w-4" />}
                label="Historial de rutas"
                onClick={handleNavClick}
              />
              <NavItem
                href="/add-route"
                icon={<Plus className="h-4 w-4" />}
                label="Agregar ruta"
                onClick={handleNavClick}
              />
            </NavGroup>

            {/* Fuel Management Group */}
            <NavGroup
              title="Combustible"
              icon={<Fuel className="h-4 w-4" />}
            >
              <NavItem
                href="/refuels-history"
                icon={<History className="h-4 w-4" />}
                label="Historial de recargas"
                onClick={handleNavClick}
              />
              <NavItem
                href="/add-refuel"
                icon={<Plus className="h-4 w-4" />}
                label="Agregar recarga"
                onClick={handleNavClick}
              />
              <NavItem
                href="/fuel-analysis"
                icon={<TrendingUp className="h-4 w-4" />}
                label="Análisis de consumo"
                onClick={handleNavClick}
              />
            </NavGroup>

            {/* Maintenance Group */}
            <NavGroup
              title="Mantenimiento"
              icon={<Wrench className="h-4 w-4" />}
            >
              <NavItem
                href="/maintenance-history"
                icon={<History className="h-4 w-4" />}
                label="Historial"
                onClick={handleNavClick}
              />
              <NavItem
                href="/add-maintenance"
                icon={<Plus className="h-4 w-4" />}
                label="Agregar mantenimiento"
                onClick={handleNavClick}
              />
              <NavItem
                href="/upcoming-maintenance"
                icon={<Calendar className="h-4 w-4" />}
                label="Próximos servicios"
                onClick={handleNavClick}
                badge={maintenanceCount > 0 ? maintenanceCount : undefined}
              />
            </NavGroup>

            {/* Expenses Group */}
            <NavGroup
              title="Gastos"
              icon={<Receipt className="h-4 w-4" />}
            >
              <NavItem
                href="/expenses-history"
                icon={<History className="h-4 w-4" />}
                label="Historial de gastos"
                onClick={handleNavClick}
              />
              <NavItem
                href="/add-expense"
                icon={<Plus className="h-4 w-4" />}
                label="Agregar gasto"
                onClick={handleNavClick}
              />
              <NavItem
                href="/expenses-summary"
                icon={<DollarSign className="h-4 w-4" />}
                label="Resumen de gastos"
                onClick={handleNavClick}
              />
              <NavItem
                href="/upcoming-expenses"
                icon={<Calendar className="h-4 w-4" />}
                label="Gastos recurrentes"
                onClick={handleNavClick}
                badge={expensesCount > 0 ? expensesCount : undefined}
              />
            </NavGroup>

            <Separator className="my-2" />

            {/* Quick Actions */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                ACCIONES RÁPIDAS
              </p>
            </div>
            <NavItem
              href="/add-route"
              icon={<Plus className="h-4 w-4" />}
              label="Nueva ruta"
              onClick={handleNavClick}
            />
            <NavItem
              href="/add-refuel"
              icon={<Plus className="h-4 w-4" />}
              label="Nueva recarga"
              onClick={handleNavClick}
            />
            <NavItem
              href="/add-expense"
              icon={<Plus className="h-4 w-4" />}
              label="Nuevo gasto"
              onClick={handleNavClick}
            />

            <Separator className="my-2" />

            {/* Settings */}
            <NavItem
              href="/profile"
              icon={<User className="h-4 w-4" />}
              label="Perfil"
              onClick={handleNavClick}
            />
            {isAdmin && (
              <NavItem
                href="/admin-users"
                icon={<Shield className="h-4 w-4" />}
                label="Panel de Admin"
                onClick={handleNavClick}
              />
            )}
          </div>
        </ScrollArea>

        {/* Footer with Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-background">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-3">Cerrar sesión</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
