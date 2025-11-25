"use client";

import { useState, useEffect } from "react";
import { UpcomingExpense, Vehicle } from "@/Types";
import { useRouter } from "next/navigation";

export default function UpcomingExpenses() {
  const [upcomingExpenses, setUpcomingExpenses] = useState<UpcomingExpense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchUpcoming();
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

  const fetchUpcoming = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedVehicle) params.append("vehicleAlias", selectedVehicle);

      const url = `/api/expenses/upcoming${params.toString() ? "?" + params.toString() : ""}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar gastos próximos");
      }

      const data = await response.json();
      setUpcomingExpenses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setLoading(true);
    fetchUpcoming();
  };

  const handleClearFilter = () => {
    setSelectedVehicle("");
    setTimeout(() => {
      setLoading(true);
      fetchUpcoming();
    }, 0);
  };

  const getCategoryLabel = (category: string): string => {
    if (category === "other") return "Otro";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getFrequencyLabel = (frequency: string): string => {
    const labels: { [key: string]: string } = {
      monthly: "Mensual",
      quarterly: "Trimestral",
      annual: "Anual",
    };
    return labels[frequency] || frequency;
  };

  const getUrgencyColor = (daysUntilDue: number): string => {
    if (daysUntilDue <= 7) return "bg-red-100 text-red-800 border-red-200";
    if (daysUntilDue <= 14) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const calculateDaysUntilDue = (nextPaymentDate: string): number => {
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    const diffTime = paymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalUpcoming = upcomingExpenses.reduce((sum, exp) => sum + exp.monto, 0);

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
              Gastos Próximos
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

        {/* Filter */}
        <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtrar</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
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
            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
              >
                Aplicar
              </button>
              <button
                onClick={handleClearFilter}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mb-6 border border-gray-200 rounded-lg p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total de Gastos Próximos</p>
              <p className="text-3xl font-semibold text-gray-900">
                Q {totalUpcoming.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Cantidad de Pagos</p>
              <p className="text-3xl font-semibold text-gray-900">
                {upcomingExpenses.length}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Expenses List */}
        {upcomingExpenses.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">
              No hay gastos recurrentes próximos
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingExpenses.map((expense) => {
              const daysUntilDue = calculateDaysUntilDue(expense.proximoPago);
              return (
                <div
                  key={expense._id}
                  className={`border rounded-lg p-6 bg-white hover:shadow-md transition-shadow ${
                    daysUntilDue <= 7 ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {expense.descripcion}
                        </h3>
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded border ${getUrgencyColor(
                            daysUntilDue
                          )}`}
                        >
                          {daysUntilDue === 0
                            ? "Hoy"
                            : daysUntilDue === 1
                            ? "Mañana"
                            : `En ${daysUntilDue} días`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Vehículo</p>
                          <p className="text-gray-900 font-medium">
                            {expense.vehicleAlias}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Categoría</p>
                          <p className="text-gray-900 font-medium capitalize">
                            {getCategoryLabel(expense.categoria)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Frecuencia</p>
                          <p className="text-gray-900 font-medium">
                            {getFrequencyLabel(expense.frecuenciaRecurrencia)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Fecha de Pago</p>
                          <p className="text-gray-900 font-medium">
                            {new Date(expense.proximoPago).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      <p className="text-sm text-gray-500 mb-1">Monto</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        Q {expense.monto.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {upcomingExpenses.length > 0 && (
          <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Urgencia de Pago:
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
                <span className="text-gray-700">≤ 7 días (Urgente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
                <span className="text-gray-700">8-14 días (Próximo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                <span className="text-gray-700">&gt; 14 días (Planificado)</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
