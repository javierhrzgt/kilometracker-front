"use client";

import { useState, useEffect } from "react";
import { ExpenseSummary, Vehicle } from "@/Types";
import { useRouter } from "next/navigation";

export default function ExpensesSummary() {
  const [summary, setSummary] = useState<ExpenseSummary[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchSummary();
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
      console.error("Error fetching vehicles:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedVehicle) params.append("vehicleAlias", selectedVehicle);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = `/api/expenses/summary${params.toString() ? "?" + params.toString() : ""}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar resumen");
      }

      const data = await response.json();
      setSummary(data.data?.summary || data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchSummary();
  };

  const handleClearFilters = () => {
    setSelectedVehicle("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      setLoading(true);
      fetchSummary();
    }, 0);
  };

  const getCategoryColor = (index: number): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-teal-500",
    ];
    return colors[index % colors.length];
  };

  const totalMonto = summary.reduce((sum, item) => sum + item.totalMonto, 0);
  const totalCantidad = summary.reduce((sum, item) => sum + item.cantidad, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              ← Volver
            </button>
            <h1 className="text-2xl font-light text-gray-900">
              Resumen de Gastos
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehículo
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <p className="text-sm text-gray-500 mb-1">Total Gastado</p>
            <p className="text-3xl font-semibold text-gray-900">
              ${totalMonto.toFixed(2)}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <p className="text-sm text-gray-500 mb-1">Total de Gastos</p>
            <p className="text-3xl font-semibold text-gray-900">{totalCantidad}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {summary.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">No se encontraron gastos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* List View */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Por Categoría
              </h2>
              <div className="space-y-4">
                {summary.map((item, index) => {
                  const percentage = totalMonto > 0 ? (item.totalMonto / totalMonto) * 100 : 0;
                  return (
                    <div key={item._id} className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded ${getCategoryColor(index)} flex items-center justify-center text-white font-semibold text-sm`}
                      >
                        {percentage.toFixed(0)}%
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item._id}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${item.totalMonto.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {item.cantidad} gasto{item.cantidad !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Gráfico de Distribución
              </h2>
              <div className="space-y-3">
                {summary.map((item, index) => {
                  const percentage = totalMonto > 0 ? (item.totalMonto / totalMonto) * 100 : 0;
                  return (
                    <div key={item._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">
                          {item._id}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${getCategoryColor(index)} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Table */}
        {summary.length > 0 && (
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porcentaje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {summary.map((item) => {
                    const percentage = totalMonto > 0 ? (item.totalMonto / totalMonto) * 100 : 0;
                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.cantidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${item.totalMonto.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          ${(item.totalMonto / item.cantidad).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {percentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
