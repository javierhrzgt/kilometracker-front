"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route, Vehicle } from "@/Types";

export default function RoutesHistory() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState({
    vehicleAlias: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  // Función helper para formatear fechas correctamente
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Sin fecha";
      
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formateando fecha:", dateString, error);
      return "Fecha inválida";
    }
  };

  const getDateValue = (dateString: string) => {
    try {
      const dateOnly = dateString.split('T')[0];
      return dateOnly;
    } catch (error) {
      return "";
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    }
  };

  const fetchRoutes = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams();
      if (filters.vehicleAlias) params.append("vehicleAlias", filters.vehicleAlias);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/routes?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar rutas");
      }

      const data = await response.json();
      setRoutes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchRoutes();
  };

  const handleClearFilters = () => {
    setFilters({ vehicleAlias: "", startDate: "", endDate: "" });
    setTimeout(() => fetchRoutes(), 0);
  };

  const handleEdit = (route: Route) => {
    setEditingRoute({
      ...route,
      fecha: getDateValue(route.fecha),
    });
  };

  const handleCancelEdit = () => {
    setEditingRoute(null);
  };

  const handleSaveEdit = async () => {
    if (!editingRoute) return;

    try {
      const response = await fetch(`/api/routes/${editingRoute._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          distanciaRecorrida: Number(editingRoute.distanciaRecorrida),
          fecha: editingRoute.fecha,
          notasAdicionales: editingRoute.notasAdicionales,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la ruta");
      }

      setEditingRoute(null);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la ruta");
      }

      setDeleteConfirm(null);
      fetchRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalKm = routes.reduce((sum, route) => sum + route.distanciaRecorrida, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                ← Volver
              </button>
              <h1 className="text-xl sm:text-2xl font-light text-gray-900">Rutas</h1>
            </div>
            <button
              onClick={() => router.push("/add-route")}
              className="self-start sm:self-auto px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
            >
              + Agregar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 bg-white">
          <h2 className="text-base font-medium mb-4 text-gray-900">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              name="vehicleAlias"
              value={filters.vehicleAlias}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
            >
              <option value="">Todos los vehículos</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle.alias}>
                  {vehicle.alias}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="Fecha inicio"
              className="border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
            />

            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="Fecha fin"
              className="border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded transition-colors px-4 py-2 text-sm"
              >
                Aplicar
              </button>
              <button
                onClick={handleClearFilters}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors px-4 py-2 text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Rutas</p>
            <p className="text-2xl sm:text-3xl font-light text-gray-900">{routes.length}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Distancia</p>
            <p className="text-2xl sm:text-3xl font-light text-gray-900">
              {totalKm.toFixed(1)} <span className="text-lg text-gray-500">km</span>
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Cargando...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">No hay rutas registradas</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {routes.map((route) => (
              <div
                key={route._id}
                className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-gray-400 transition-colors bg-white"
              >
                {editingRoute && editingRoute._id === route._id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <h3 className="text-lg font-medium text-gray-900">{route.vehicleAlias}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Distancia (km)</label>
                        <input
                          type="number"
                          value={editingRoute.distanciaRecorrida}
                          onChange={(e) =>
                            setEditingRoute({ ...editingRoute, distanciaRecorrida: e.target.value as any })
                          }
                          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Fecha</label>
                        <input
                          type="date"
                          value={editingRoute.fecha}
                          onChange={(e) => setEditingRoute({ ...editingRoute, fecha: e.target.value })}
                          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Notas</label>
                        <input
                          type="text"
                          value={editingRoute.notasAdicionales}
                          onChange={(e) =>
                            setEditingRoute({ ...editingRoute, notasAdicionales: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{route.vehicleAlias}</h3>
                        <p className="text-sm text-gray-500">{formatDate(route.fecha)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(route._id)}
                          className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Distancia:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {route.distanciaRecorrida} km
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Notas:</span>
                        <span className="ml-2 text-gray-700">{route.notasAdicionales || "Sin notas"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm === route._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-3">¿Eliminar esta ruta?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(route._id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded text-sm transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}