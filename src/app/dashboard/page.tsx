"use client";

import { useState, useEffect, MouseEvent } from "react";
import { Vehicle } from "@/Types";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async (): Promise<void> => {
    try {
      const response = await fetch("/api/vehicles", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error(data.error || "Error al cargar vehículos");
      }

      setVehicles(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/");
  };

  const handleDelete = async (alias:string): Promise<void> => {
    try {
      const response = await fetch(`/api/vehicles/${alias}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el vehículo");
      }

      setDeleteConfirm(null);
      fetchVehicles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  // Filtrar vehículos según el estado del checkbox
  const filteredVehicles = showInactive
    ? vehicles
    : vehicles.filter((vehicle) => vehicle.isActive);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light text-gray-900">Vehículos</h1>

            {/* Desktop Actions */}
            <div className="hidden md:flex flex-wrap gap-2">
              <button
                onClick={() => router.push("/add-vehicle")}
                className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded"
              >
                + Vehículo
              </button>
              <button
                onClick={() => router.push("/add-route")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
              >
                + Ruta
              </button>
              <button
                onClick={() => router.push("/add-refuel")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
              >
                + Recarga
              </button>
              <button
                onClick={() => router.push("/routes-history")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
              >
                Rutas
              </button>
              <button
                onClick={() => router.push("/refuels-history")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
              >
                Recargas
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
              >
                Perfil
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Salir
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    router.push("/add-vehicle");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded"
                >
                  + Agregar Vehículo
                </button>
                <button
                  onClick={() => {
                    router.push("/add-route");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
                >
                  + Agregar Ruta
                </button>
                <button
                  onClick={() => {
                    router.push("/add-refuel");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
                >
                  + Agregar Recarga
                </button>
                <button
                  onClick={() => {
                    router.push("/routes-history");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
                >
                  Ver Historial de Rutas
                </button>
                <button
                  onClick={() => {
                    router.push("/refuels-history");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
                >
                  Ver Historial de Recargas
                </button>
                <button
                  onClick={() => {
                    router.push("/profile");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
                >
                  Ver Perfil
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 border border-red-200 transition-colors rounded"
                >
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {/* Count & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <p className="text-sm text-gray-500">
            {filteredVehicles.length}{" "}
            {filteredVehicles.length === 1 ? "vehículo" : "vehículos"}
            {!showInactive &&
              vehicles.filter((v:Vehicle) => !v.isActive).length > 0 && (
                <span className="text-gray-400">
                  {" "}
                  ({vehicles.filter((v:Vehicle) => !v.isActive).length} inactivo
                  {vehicles.filter((v:Vehicle) => !v.isActive).length !== 1
                    ? "s"
                    : ""}{" "}
                  oculto
                  {vehicles.filter((v:Vehicle) => !v.isActive).length !== 1 ? "s" : ""})
                </span>
              )}
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-700">Mostrar inactivos</span>
          </label>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">
              {vehicles.length === 0
                ? "No hay vehículos registrados"
                : "No hay vehículos activos"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                onClick={() => router.push(`/vehicle-stats/${vehicle.alias}`)}
                className={`border rounded-lg p-5 hover:border-gray-400 transition-colors bg-white cursor-pointer ${
                  vehicle.isActive
                    ? "border-gray-200"
                    : "border-gray-200 opacity-60"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {vehicle.alias}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {vehicle.marca} {vehicle.modelo}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {vehicle.isActive ? (
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Placas</span>
                    <span className="font-mono text-gray-900">
                      {vehicle.plates}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Km recorridos</span>
                    <span className="text-gray-900 font-medium">
                      {(
                        vehicle.kilometrajeTotal - vehicle.kilometrajeInicial
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="text-gray-600">
                      {vehicle.kilometrajeTotal.toLocaleString()} km
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      router.push(`/vehicle-stats/${vehicle.alias}`);
                    }}
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 border border-gray-200 rounded transition-colors"
                  >
                    Estadísticas
                  </button>
                  <button
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      router.push(`/fuel-analysis/${vehicle.alias}`);
                    }}
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 border border-gray-200 rounded transition-colors"
                  >
                    Combustible
                  </button>
                  <button
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      router.push(`/edit-vehicle/${vehicle.alias}`);
                    }}
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 border border-gray-200 rounded transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setDeleteConfirm(vehicle.alias);
                    }}
                    className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === vehicle.alias && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-3">
                      ¿Eliminar este vehículo?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleDelete(vehicle.alias);
                        }}
                        className="flex-1 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          setDeleteConfirm(null);
                        }}
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
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
