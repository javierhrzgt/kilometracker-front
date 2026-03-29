"use client";

import { useState, useEffect } from "react";
import { User } from "@/Types";
import { useRouter } from "next/navigation";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUser } from "@/contexts/UserContext";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    userId: string;
    username: string;
    step: 'warning' | 'confirm';
  } | null>(null);
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteConfirmWord, setDeleteConfirmWord] = useState('');
  const [sendingCode, setSendingCode] = useState(false);

  const router = useRouter();
  const { isRoot } = useUser();

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

      // Allow admin and root to access this page
      if (userData.role !== "admin" && userData.role !== "root") {
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

  const handleRequestDeleteCode = async () => {
    if (!permanentDeleteModal) return;
    setSendingCode(true);
    try {
      const res = await fetch(`/api/auth/users/${permanentDeleteModal.userId}/permanent/request`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar código');
      setPermanentDeleteModal(prev => prev ? { ...prev, step: 'confirm' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSendingCode(false);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteModal) return;
    setProcessingUserId(permanentDeleteModal.userId);
    try {
      const res = await fetch(`/api/auth/users/${permanentDeleteModal.userId}/permanent`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: deleteCode, confirmWord: deleteConfirmWord }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
      setSuccess('Usuario eliminado permanentemente');
      setPermanentDeleteModal(null);
      setDeleteCode('');
      setDeleteConfirmWord('');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setProcessingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case "root":
        return "bg-red-100 text-red-800 border border-red-300";
      case "admin":
        return "bg-purple/10 text-purple border border-purple/20";
      case "write":
        return "bg-info/10 text-info border border-info/20";
      case "read":
        return "bg-secondary text-secondary-foreground border border-border";
      default:
        return "bg-secondary text-secondary-foreground border border-border";
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="flex justify-center items-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administrar usuarios y permisos del sistema"
      />

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
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Mostrar usuarios inactivos
          </label>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {users.length} usuario{users.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </span>
                          {user._id === currentUser._id && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">(Tú)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === "root" ? (
                          <select
                            value="root"
                            disabled
                            className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          >
                            <option value="root" disabled>Root</option>
                          </select>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            disabled={
                              processingUserId === user._id ||
                              user._id === currentUser._id
                            }
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:border-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          >
                            <option value="read">Read</option>
                            <option value="write">Write</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatDateForDisplay(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {user._id !== currentUser._id && (
                          <div className="flex items-center justify-end gap-2">
                            {/* Show deactivate/reactivate only when target is not admin/root, OR current user is root */}
                            {(user.role !== "admin" && user.role !== "root") || isRoot ? (
                              <>
                                {user.isActive ? (
                                  <button
                                    onClick={() => handleDeactivate(user._id)}
                                    disabled={processingUserId === user._id}
                                    className="px-2.5 py-1 text-xs font-medium rounded border border-amber-400 text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Desactivar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleReactivate(user._id)}
                                    disabled={processingUserId === user._id}
                                    className="px-2.5 py-1 text-xs font-medium rounded border border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Reactivar
                                  </button>
                                )}
                              </>
                            ) : null}
                            {isRoot && (
                              <button
                                onClick={() => {
                                  setError('');
                                  setSuccess('');
                                  setPermanentDeleteModal({ userId: user._id, username: user.username, step: 'warning' });
                                }}
                                disabled={processingUserId === user._id}
                                className="px-2.5 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
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
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Roles de Usuario:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-gray-700 dark:text-gray-300">
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
            <div>
              <span className="font-medium">Root:</span> Superadministrador con
              capacidad de eliminación permanente de usuarios y todos sus datos
            </div>
          </div>
        </div>
      </main>

      {/* Permanent Delete Modal */}
      {permanentDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {permanentDeleteModal.step === 'warning' && (
              <>
                <div className="bg-red-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">
                    Eliminar usuario permanentemente
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <div className="mb-4 p-4 bg-red-50 dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      ADVERTENCIA: Esta acción es IRREVERSIBLE
                    </p>
                    <p className="text-sm text-red-700 mb-3">
                      Estás a punto de eliminar permanentemente al usuario{" "}
                      <span className="font-bold">{permanentDeleteModal.username}</span> y
                      TODOS sus datos asociados, incluyendo:
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      <li>Todos sus vehículos registrados</li>
                      <li>Todas sus rutas y kilometraje</li>
                      <li>Todos sus registros de recargas de combustible</li>
                      <li>Todos sus registros de mantenimiento</li>
                      <li>Todos sus gastos registrados</li>
                    </ul>
                    <p className="text-sm font-semibold text-red-800 mt-3">
                      No hay forma de recuperar esta información una vez eliminada.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setPermanentDeleteModal(null);
                        setDeleteCode('');
                        setDeleteConfirmWord('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRequestDeleteCode}
                      disabled={sendingCode}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingCode ? 'Enviando...' : 'Enviar código de verificación a mi correo'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {permanentDeleteModal.step === 'confirm' && (
              <>
                <div className="bg-red-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">
                    Confirmar eliminación permanente
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-5">
                    Se ha enviado un código de verificación de 6 dígitos a tu correo electrónico. Ingresa el código y escribe{" "}
                    <span className="font-bold text-red-700">ELIMINAR</span> para confirmar.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código de verificación (6 dígitos)
                    </label>
                    <input
                      type="text"
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 tracking-widest text-center text-lg font-mono dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Escribe <span className="font-bold text-red-700">ELIMINAR</span> para confirmar
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmWord}
                      onChange={(e) => setDeleteConfirmWord(e.target.value)}
                      placeholder="ELIMINAR"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setPermanentDeleteModal(null);
                        setDeleteCode('');
                        setDeleteConfirmWord('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmPermanentDelete}
                      disabled={
                        deleteCode.length !== 6 ||
                        deleteConfirmWord !== 'ELIMINAR' ||
                        processingUserId === permanentDeleteModal.userId
                      }
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingUserId === permanentDeleteModal.userId
                        ? 'Eliminando...'
                        : 'Confirmar eliminación permanente'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
