"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Maintenance, Vehicle, MaintenanceFilters } from "@/Types";
import { formatDateForDisplay } from "@/lib/dateUtils";

const MAINTENANCE_TYPES = [
  "Cambio de aceite",
  "Rotación de llantas",
  "Frenos",
  "Inspección",
  "Reparación",
  "Batería",
  "Filtros",
  "Transmisión",
  "Suspensión",
  "Alineación",
  "Otro",
];

export default function MaintenanceHistory() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<MaintenanceFilters>({
    vehicleAlias: "",
    tipo: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchMaintenances();
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar vehículos");
      }

      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.vehicleAlias) params.append("vehicleAlias", filters.vehicleAlias);
      if (filters.tipo) params.append("tipo", filters.tipo);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/maintenance?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar mantenimientos");
      }

      const data = await response.json();
      setMaintenances(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      vehicleAlias: "",
      tipo: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ ADVERTENCIA: Esta acción eliminará permanentemente este mantenimiento y no se puede deshacer. ¿Estás seguro?")) return;

    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el mantenimiento");
      }

      // Refresh the list
      fetchMaintenances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalCost = maintenances.reduce((sum, m) => sum + m.costo, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                ← Volver
              </button>
              <h1 className="text-xl sm:text-2xl font-light text-gray-900">
                Historial de Mantenimientos
              </h1>
            </div>
            <button
              onClick={() => router.push("/add-maintenance")}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors text-sm sm:text-base"
            >
              + Agregar Mantenimiento
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-gray-900">Filtros</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpiar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vehículo
              </label>
              <select
                name="vehicleAlias"
                value={filters.vehicleAlias}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              >
                <option value="">Todos</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle.alias}>
                    {vehicle.alias}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                name="tipo"
                value={filters.tipo}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              >
                <option value="">Todos</option>
                {MAINTENANCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-xs text-gray-500 mb-1">Total Mantenimientos</p>
            <p className="text-2xl font-light text-gray-900">{maintenances.length}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-xs text-gray-500 mb-1">Costo Total</p>
            <p className="text-2xl font-light text-gray-900">Q {totalCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-gray-600">Cargando...</div>
          </div>
        ) : maintenances.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400 mb-4">No hay mantenimientos registrados</p>
            <button
              onClick={() => router.push("/add-maintenance")}
              className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
            >
              Agregar Mantenimiento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {maintenances.map((maintenance) => (
              <div
                key={maintenance._id}
                className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 mb-1">
                          {maintenance.tipo}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {maintenance.descripcion}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>
                            Vehículo: {maintenance.vehicle?.alias || maintenance.vehicleAlias}
                          </span>
                          <span>Fecha: {formatDateForDisplay(maintenance.fecha)}</span>
                          <span>Kilometraje: {maintenance.kilometraje.toLocaleString()} km</span>
                          {maintenance.proveedor && (
                            <span>Proveedor: {maintenance.proveedor}</span>
                          )}
                        </div>
                        {maintenance.proximoServicioFecha && (
                          <div className="mt-2 text-xs text-blue-600">
                            Próximo servicio: {formatDateForDisplay(maintenance.proximoServicioFecha)}
                            {maintenance.proximoServicioKm && ` - ${maintenance.proximoServicioKm.toLocaleString()} km`}
                          </div>
                        )}
                        {maintenance.notas && (
                          <p className="mt-2 text-xs text-gray-500 italic">
                            {maintenance.notas}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        Q {maintenance.costo.toFixed(2)}
                      </p>
                      {!maintenance.isActive && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/edit-maintenance/${maintenance._id}`)}
                        className="px-3 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(maintenance._id)}
                        className="px-3 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
