"use client";

import { useState, useEffect } from "react";
import { Expense, Vehicle, ExpenseFilters } from "@/Types";
import { useRouter } from "next/navigation";
import { formatDateForDisplay } from "@/lib/dateUtils";

const EXPENSE_CATEGORIES = [
  "Seguro",
  "Impuestos",
  "Registro",
  "Estacionamiento",
  "Peajes",
  "Lavado",
  "Multas",
  "Financiamiento",
  "Otro",
];

export default function ExpensesHistory() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    vehicleAlias: "",
    categoria: "",
    startDate: "",
    endDate: "",
    esDeducibleImpuestos: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
    fetchExpenses();
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

  const fetchExpenses = async () => {
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.vehicleAlias) params.append("vehicleAlias", filters.vehicleAlias);
      if (filters.categoria) params.append("categoria", filters.categoria);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.esDeducibleImpuestos) params.append("esDeducibleImpuestos", filters.esDeducibleImpuestos);

      const url = `/api/expenses${params.toString() ? "?" + params.toString() : ""}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar gastos");
      }

      const data = await response.json();
      setExpenses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setFilters({
      vehicleAlias: "",
      categoria: "",
      startDate: "",
      endDate: "",
      esDeducibleImpuestos: "",
    });
    setTimeout(() => {
      setLoading(true);
      fetchExpenses();
    }, 0);
  };

  const handleDelete = async (id: string) => {
    // Additional confirmation for permanent delete
    if (!confirm("⚠️ ADVERTENCIA: Esta acción eliminará permanentemente este gasto y no se puede deshacer. ¿Estás seguro?")) {
      setDeleteConfirm(null);
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el gasto");
      }

      setDeleteConfirm(null);
      fetchExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const totalMonto = expenses.reduce((sum, expense) => sum + expense.monto, 0);
  const taxDeductibleTotal = expenses
    .filter((e) => e.esDeducibleImpuestos)
    .reduce((sum, expense) => sum + expense.monto, 0);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
              >
                ← Volver
              </button>
              <h1 className="text-2xl font-light text-gray-900">
                Historial de Gastos
              </h1>
            </div>
            <button
              onClick={() => router.push("/add-expense")}
              className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded"
            >
              + Nuevo Gasto
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                name="categoria"
                value={filters.categoria}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              >
                <option value="">Todas</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deducible
              </label>
              <select
                name="esDeducibleImpuestos"
                value={filters.esDeducibleImpuestos}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded p-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-sm text-gray-500 mb-1">Total Gastos</p>
            <p className="text-2xl font-semibold text-gray-900">
              Q {totalMonto.toFixed(2)}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-sm text-gray-500 mb-1">Deducibles</p>
            <p className="text-2xl font-semibold text-green-600">
              Q {taxDeductibleTotal.toFixed(2)}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <p className="text-sm text-gray-500 mb-1">Cantidad</p>
            <p className="text-2xl font-semibold text-gray-900">
              {expenses.length}
            </p>
          </div>
        </div>

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-lg">
            <p className="text-gray-400">No se encontraron gastos</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateForDisplay(expense.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {expense.vehicleAlias}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {expense.categoria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {expense.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Q {expense.monto.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          {expense.esRecurrente && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                              {expense.frecuenciaRecurrencia}
                            </span>
                          )}
                          {expense.esDeducibleImpuestos && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                              Deducible
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {deleteConfirm === expense._id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => router.push(`/edit-expense/${expense._id}`)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(expense._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
