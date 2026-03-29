"use client";

import { useRouter } from "next/navigation";
import { Vehicle } from "@/Types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal, BarChart2, Fuel, Pencil, Trash2 } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete?: (alias: string) => void;
}

export function VehicleCard({ vehicle, onDelete }: VehicleCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/vehicle-stats/${vehicle.alias}`)}
      className={cn(
        "cursor-pointer hover:shadow-depth-3 transition-elevation hover:border-primary/50",
        !vehicle.isActive && "opacity-60"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-foreground truncate">
              {vehicle.alias}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {vehicle.marca} {vehicle.modelo}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {vehicle.isActive ? (
              <div className="w-2 h-2 rounded-full bg-success mt-1" />
            ) : (
              <span className="text-xs text-muted-foreground font-medium">Inactivo</span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={() => router.push(`/vehicle-stats/${vehicle.alias}`)}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Estadísticas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/fuel-analysis/${vehicle.alias}`)}
                >
                  <Fuel className="h-4 w-4 mr-2" />
                  Combustible
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/edit-vehicle/${vehicle.alias}`)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(vehicle.alias)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Placas</span>
            <span className="font-mono text-foreground">{vehicle.plates}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Km recorridos</span>
            <span className="font-medium text-foreground">
              {(vehicle.kilometrajeTotal - vehicle.kilometrajeInicial).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-muted-foreground">
              {vehicle.kilometrajeTotal.toLocaleString()} km
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
