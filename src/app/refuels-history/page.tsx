"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Refuel, Vehicle } from "@/Types";

export default function RefuelsHistory() {
  const [refuels, setRefuels] = useState<Refuel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filterVehicle, setFilterVehicle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRefuel, setEditingRefuel] = useState<Refuel | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const tiposCombustible = ["Regular", "Super", "V-Power", "Diesel"];

  useEffect(() => {
    fetchVehicles();
    fetchRefuels();
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

  const fetchRefuels = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams();
      if (filterVehicle) params.append("vehicleAlias", filterVehicle);

      const response = await fetch(`/api/refuels?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar reabastecimientos");
      }

      const data = await response.json();
      setRefuels(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterVehicle(e.target.value);
  };

  const handleApplyFilter = () => {
    fetchRefuels();
  };

  const handleClearFilter = () => {
    setFilterVehicle("");
    setTimeout(() => fetchRefuels(), 0);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Sin fecha";
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
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

  const handleEdit = (refuel: Refuel) => {
    setEditingRefuel({
      ...refuel,
      fecha: getDateValue(refuel.fecha),
    });
  };

  const handleCancelEdit = () => {
    setEditingRefuel(null);
  };

  const handleSaveEdit = async () => {
    if (!editingRefuel) return;

    try {
      const response = await fetch(`/api/refuels/${editingRefuel._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tipoCombustible: editingRefuel.tipoCombustible,
          cantidadGastada: Number(editingRefuel.cantidadGastada),
          galones: editingRefuel.galones ? Number(editingRefuel.galones) : null,
          fecha: editingRefuel.fecha,
          notasAdicionales: editingRefuel.notasAdicionales,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el reabastecimiento");
      }

      setEditingRefuel(null);
      fetchRefuels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/refuels/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el reabastecimiento");
      }

      setDeleteConfirm(null);
      fetchRefuels();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalGastado = refuels.reduce((sum, refuel) => sum + Number(refuel.cantidadGastada || 0), 0);
  const totalGalones = refuels.reduce((sum, refuel) => sum + Number(refuel.galones || 0), 0);

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
              <h1 className="text-xl sm:text-2xl font-light text-gray-900">Recargas</h1>
            </div>
            <button
              onClick={() => router.push("/add-refuel")}
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
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterVehicle}
              onChange={handleFilterChange}
              className="flex-1 border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
            >
              <option value="">Todos los vehículos</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle.alias}>
                  {vehicle.alias}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                className="flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white rounded transition-colors px-6 py-2 text-sm"
              >
                Aplicar
              </button>
              <button
                onClick={handleClearFilter}
                className="flex-1 sm:flex-none border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors px-6 py-2 text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Recargas</p>
            <p className="text-xl sm:text-3xl font-light text-gray-900">{refuels.length}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Total</p>
            <p className="text-xl sm:text-3xl font-light text-gray-900">Q {totalGastado.toFixed(2)}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Galones</p>
            <p className="text-xl sm:text-3xl font-light text-gray-900">{totalGalones.toFixed(2)}</p>
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
        ) : refuels.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">No hay recargas registradas</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {refuels.map((refuel) => (
              <div
                key={refuel._id}
                className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-gray-400 transition-colors bg-white"
              >
                {editingRefuel && editingRefuel._id === refuel._id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <h3 className="text-lg font-medium text-gray-900">{refuel.vehicleAlias}</h3>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Tipo</label>
                        <select
                          value={editingRefuel.tipoCombustible}
                          onChange={(e) =>
                            setEditingRefuel({ ...editingRefuel, tipoCombustible: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                        >
                          {tiposCombustible.map((tipo) => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Monto (Q)</label>
                        <input
                          type="number"
                          value={editingRefuel.cantidadGastada}
                          onChange={(e) =>
                            setEditingRefuel({ ...editingRefuel, cantidadGastada: e.target.value as any })
                          }
                          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Galones</label>
                        <input
                          type="number"
                          value={editingRefuel.galones || ""}
                          onChange={(e) =>
                            setEditingRefuel({ ...editingRefuel, galones: e.target.value as any })
                          }
                          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Fecha</label>
                        <input
                          type="date"
                          value={editingRefuel.fecha}
                          onChange={(e) => setEditingRefuel({ ...editingRefuel, fecha: e.target.value })}
                          className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Notas</label>
                      <input
                        type="text"
                        value={editingRefuel.notasAdicionales || ""}
                        onChange={(e) =>
                          setEditingRefuel({ ...editingRefuel, notasAdicionales: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{refuel.vehicleAlias}</h3>
                        <p className="text-sm text-gray-500">{formatDate(refuel.fecha)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(refuel)}
                          className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(refuel._id)}
                          className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Tipo:</span>
                        <span className="ml-2 font-medium text-gray-900">{refuel.tipoCombustible}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Monto:</span>
                        <span className="ml-2 font-medium text-gray-900">Q {Number(refuel.cantidadGastada).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Galones:</span>
                        <span className="ml-2 font-medium text-gray-900">{refuel.galones ? Number(refuel.galones).toFixed(2) : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Precio/gal:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {refuel.precioPorGalon ? `Q ${Number(refuel.precioPorGalon).toFixed(2)}` : "N/A"}
                        </span>
                      </div>
                    </div>

                    {refuel.notasAdicionales && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Notas:</span>
                        <span className="ml-2 text-gray-700">{refuel.notasAdicionales}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm === refuel._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 mb-3">¿Eliminar esta recarga?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(refuel._id)}
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