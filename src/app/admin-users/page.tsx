"use client";

import { useState, useEffect } from "react";
import { User } from "@/Types";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [showInactive]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Error al cargar perfil");
      }

      const data = await response.json();
      const userData = data.data;

      // Check if user is admin
      if (userData.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setCurrentUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      router.push("/dashboard");
    }
  };

  const fetchUsers = async (): Promise<void> => {
    try {
      const url = showInactive
        ? "/api/auth/users"
        : "/api/auth/users?isActive=true";

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/dashboard");
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Error al cargar usuarios");
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string): Promise<void> => {
    setError("");
    setSuccess("");
    setProcessingUserId(userId);

    try {
      const response = await fetch(`/api/auth/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar rol");
      }

      setSuccess("Rol actualizado exitosamente");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDeactivate = async (userId: string): Promise<void> => {
    if (!confirm("¿Estás seguro de que deseas desactivar este usuario?")) {
      return;
    }

    setError("");
    setSuccess("");
    setProcessingUserId(userId);

    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al desactivar usuario");
      }

      setSuccess("Usuario desactivado exitosamente");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleReactivate = async (userId: string): Promise<void> => {
    setError("");
    setSuccess("");
    setProcessingUserId(userId);

    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al reactivar usuario");
      }

      setSuccess("Usuario reactivado exitosamente");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setProcessingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "write":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || !currentUser) {
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
                Gestión de Usuarios
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Mostrar usuarios inactivos
          </label>
          <div className="text-sm text-gray-500">
            Total: {users.length} usuario{users.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {user.username}
                          </span>
                          {user._id === currentUser._id && (
                            <span className="text-xs text-gray-500">(Tú)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          disabled={
                            processingUserId === user._id ||
                            user._id === currentUser._id
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="read">Read</option>
                          <option value="write">Write</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(user.createdAt).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {user._id !== currentUser._id && (
                          <>
                            {user.isActive ? (
                              <button
                                onClick={() => handleDeactivate(user._id)}
                                disabled={processingUserId === user._id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Desactivar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(user._id)}
                                disabled={processingUserId === user._id}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reactivar
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Roles de Usuario:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
            <div>
              <span className="font-medium">Read:</span> Solo lectura, puede ver
              información
            </div>
            <div>
              <span className="font-medium">Write:</span> Puede crear y editar
              contenido
            </div>
            <div>
              <span className="font-medium">Admin:</span> Acceso completo,
              incluyendo gestión de usuarios
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
