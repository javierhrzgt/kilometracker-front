"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
      
      setUser(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch("/api/auth/updateprofile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil");
      }

      setSuccess(true);
      fetchProfile();

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-gray-100">
        <div className="text-xl">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>

        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
            ✓ Perfil actualizado exitosamente
          </div>
        )}

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <div className="space-y-6">
            {/* Info del usuario */}
            <div className="pb-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Información de la cuenta</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Rol</p>
                  <p className="font-semibold capitalize">{user?.role}</p>
                </div>
                <div>
                  <p className="text-gray-400">Estado</p>
                  <p className={`font-semibold ${user?.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {user?.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Cuenta creada</p>
                  <p>{new Date(user?.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-gray-400">Última actualización</p>
                  <p>{new Date(user?.updatedAt).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </div>

            {/* Formulario de edición */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Editar perfil</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Nombre de usuario
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full border rounded-md p-3 bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full border rounded-md p-3 bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}