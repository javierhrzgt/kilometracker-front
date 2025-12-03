"use client";

import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Vehicle } from "@/Types";
import { Button } from "@/components/ui/button";

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete?: (alias: string) => void;
}

export function VehicleCard({ vehicle, onDelete }: VehicleCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(vehicle.alias);
    }
    setDeleteConfirm(false);
  };

  return (
    <div
      onClick={() => router.push(`/vehicle-stats/${vehicle.alias}`)}
      className={`border rounded-lg p-5 shadow-sm hover:shadow-depth-3 transition-elevation bg-card cursor-pointer ${
        vehicle.isActive ? "border-border hover:border-primary/50" : "border-border opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-foreground truncate">
            {vehicle.alias}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {vehicle.marca} {vehicle.modelo}
          </p>
        </div>
        <div className="ml-3 flex-shrink-0">
          {vehicle.isActive ? (
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
          ) : (
            <span className="text-xs text-muted-foreground font-medium">
              Inactivo
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Placas</span>
          <span className="font-mono text-foreground">{vehicle.plates}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Km recorridos</span>
          <span className="text-foreground font-medium">
            {(
              vehicle.kilometrajeTotal - vehicle.kilometrajeInicial
            ).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-muted-foreground">
            {vehicle.kilometrajeTotal.toLocaleString()} km
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="transition-smooth hover:bg-info/10 hover:border-info hover:text-info"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            router.push(`/vehicle-stats/${vehicle.alias}`);
          }}
        >
          Estadísticas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="transition-smooth hover:bg-warning/10 hover:border-warning hover:text-warning"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            router.push(`/fuel-analysis/${vehicle.alias}`);
          }}
        >
          Combustible
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="transition-smooth hover:bg-purple/10 hover:border-purple hover:text-purple"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            router.push(`/edit-vehicle/${vehicle.alias}`);
          }}
        >
          Editar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setDeleteConfirm(true);
          }}
        >
          Eliminar
        </Button>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-foreground mb-3">
            ¿Eliminar este vehículo?
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleDelete}
            >
              Confirmar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setDeleteConfirm(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
