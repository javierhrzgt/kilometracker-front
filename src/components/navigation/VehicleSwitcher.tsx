"use client";

import { useVehicle } from "@/contexts/VehicleContext";
import { usePathname, useRouter } from "next/navigation";
import { Car, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Vehicle } from "@/Types";

interface VehicleSwitcherProps {
  isCollapsed?: boolean;
}

export function VehicleSwitcher({ isCollapsed = false }: VehicleSwitcherProps) {
  const { vehicles, selectedVehicle, setSelectedVehicle, isLoading } = useVehicle();
  const pathname = usePathname();
  const router = useRouter();

  const handleVehicleSelect = (vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);

    // Context-aware navigation based on current route
    if (pathname === "/dashboard") {
      // On dashboard: Navigate to vehicle stats
      if (vehicle) {
        router.push(`/vehicle-stats/${vehicle.alias}`);
      }
    } else if (pathname.startsWith("/vehicle-stats/") || pathname.startsWith("/fuel-analysis/")) {
      // On stats pages: Navigate to same page type with new vehicle
      const pageType = pathname.includes("fuel-analysis") ? "fuel-analysis" : "vehicle-stats";
      if (vehicle) {
        router.push(`/${pageType}/${vehicle.alias}`);
      } else {
        router.push("/dashboard");
      }
    }
    // On add forms: selection is handled by context, form reads from context
    // No navigation needed
  };

  const displayName = selectedVehicle
    ? `${selectedVehicle.alias}`
    : "Todos los vehículos";

  const displayDetails = selectedVehicle
    ? `${selectedVehicle.marca} ${selectedVehicle.modelo}`
    : `${vehicles.length} vehículos`;

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center p-2",
        isCollapsed ? "px-2" : "px-3"
      )}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10"
            title={displayName}
          >
            <Car className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64" side="right">
          <DropdownMenuLabel>Seleccionar vehículo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleVehicleSelect(null)}>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Todos los vehículos</span>
              <span className="text-xs text-muted-foreground">
                {vehicles.length} vehículos activos
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {vehicles.map((vehicle) => (
            <DropdownMenuItem
              key={vehicle._id}
              onClick={() => handleVehicleSelect(vehicle)}
              className={cn(
                selectedVehicle?.alias === vehicle.alias && "bg-accent"
              )}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{vehicle.alias}</span>
                  {selectedVehicle?.alias === vehicle.alias && (
                    <Car className="h-3 w-3 text-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {vehicle.marca} {vehicle.modelo}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Car className="h-4 w-4 flex-shrink-0" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium text-sm truncate w-full text-left">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground truncate w-full text-left">
                {displayDetails}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuLabel>Seleccionar vehículo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleVehicleSelect(null)}>
          <div className="flex flex-col gap-1">
            <span className="font-medium">Todos los vehículos</span>
            <span className="text-xs text-muted-foreground">
              {vehicles.length} vehículos activos
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {vehicles.map((vehicle) => (
          <DropdownMenuItem
            key={vehicle._id}
            onClick={() => handleVehicleSelect(vehicle)}
            className={cn(
              selectedVehicle?.alias === vehicle.alias && "bg-accent"
            )}
          >
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between">
                <span className="font-medium">{vehicle.alias}</span>
                {selectedVehicle?.alias === vehicle.alias && (
                  <Car className="h-3 w-3 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {vehicle.marca} {vehicle.modelo}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
