"use client";

import { useState, useEffect } from "react";
import { User } from "@/Types";
import { useRouter } from "next/navigation";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { StatCard } from "@/components/features/stats/StatCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Info, Users, UserCheck, ShieldCheck, UserMinus, AlertCircle, MoreHorizontal, Trash2,
} from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";

type RoleVariant = NonNullable<BadgeProps["variant"]>;

const roleBadgeVariant = (role: string): RoleVariant => {
  switch (role) {
    case "root":  return "destructive";
    case "admin": return "purple";
    case "write": return "info";
    default:      return "muted";
  }
};

const roleLabel = (role: string) => {
  switch (role) {
    case "root":  return "Root";
    case "admin": return "Admin";
    case "write": return "Write";
    default:      return "Read";
  }
};

const roleDesc = (role: string) => {
  switch (role) {
    case "write": return "Crear y editar contenido";
    case "admin": return "Acceso completo + gestión";
    default:      return "Solo lectura";
  }
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [activeSheetUserId, setActiveSheetUserId] = useState<string | null>(null);

  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    userId: string;
    username: string;
    step: "warning" | "confirm";
  } | null>(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteConfirmWord, setDeleteConfirmWord] = useState("");
  const [sendingCode, setSendingCode] = useState(false);

  const router = useRouter();
  const { isRoot } = useUser();

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [showInactive]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401) { router.push("/"); return; }
        throw new Error("Error al cargar perfil");
      }
      const data = await response.json();
      const userData = data.data;
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
      const url = showInactive ? "/api/auth/users" : "/api/auth/users?isActive=true";
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { router.push("/dashboard"); return; }
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
    setError(""); setSuccess("");
    setProcessingUserId(userId);
    try {
      const response = await fetch(`/api/auth/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al cambiar rol");
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
    if (!confirm("¿Estás seguro de que deseas desactivar este usuario?")) return;
    setError(""); setSuccess("");
    setProcessingUserId(userId);
    try {
      const response = await fetch(`/api/auth/users/${userId}`, { method: "DELETE", credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al desactivar usuario");
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
    setError(""); setSuccess("");
    setProcessingUserId(userId);
    try {
      const response = await fetch(`/api/auth/users/${userId}`, { method: "PATCH", credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al reactivar usuario");
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
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar código");
      setPermanentDeleteModal((prev) => prev ? { ...prev, step: "confirm" } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSendingCode(false);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteModal) return;
    setProcessingUserId(permanentDeleteModal.userId);
    try {
      const res = await fetch(`/api/auth/users/${permanentDeleteModal.userId}/permanent`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: deleteCode, confirmWord: deleteConfirmWord }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");
      setSuccess("Usuario eliminado permanentemente");
      setPermanentDeleteModal(null);
      setDeleteCode(""); setDeleteConfirmWord("");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setProcessingUserId(null);
    }
  };

  const openDeleteModal = (userId: string, username: string) => {
    setError(""); setSuccess("");
    setActiveSheetUserId(null);
    setPermanentDeleteModal({ userId, username, step: "warning" });
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalUsers    = users.length;
  const activeUsers   = users.filter((u) => u.isActive).length;
  const adminUsers    = users.filter((u) => u.role === "admin" || u.role === "root").length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  if (loading || !currentUser) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <CardSkeleton rows={6} />
      </main>
    );
  }

  return (
    <>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administrar usuarios y permisos del sistema"
        actions={
          <Button variant="ghost" size="sm" onClick={() => setRolesDialogOpen(true)}
            className="gap-1.5 text-muted-foreground"
          >
            <Info className="h-4 w-4" />
            Roles
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-success/20 bg-success/10 text-success">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Usuarios" value={totalUsers} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Activos" value={activeUsers} icon={<UserCheck className="h-5 w-5" />} accent="success" />
          <StatCard label="Admins" value={adminUsers} icon={<ShieldCheck className="h-5 w-5" />} accent="purple" />
          <StatCard label="Inactivos" value={inactiveUsers} icon={<UserMinus className="h-5 w-5" />}
            accent={inactiveUsers > 0 ? "warning" : undefined}
          />
        </div>

        {/* Filter */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <Checkbox checked={showInactive} onCheckedChange={(val) => setShowInactive(val as boolean)} />
          <span className="text-sm text-foreground">Mostrar usuarios inactivos</span>
        </label>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {user.username}
                      {user._id === currentUser._id && (
                        <span className="ml-2 text-xs text-muted-foreground">(Tú)</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <span className="block truncate text-muted-foreground" title={user.email}>
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "muted"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDateForDisplay(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      {user._id !== currentUser._id && (
                        <>
                          {/* ── Mobile: Sheet (bottom) ─────────────────── */}
                          <div className="md:hidden">
                            <Sheet
                              open={activeSheetUserId === user._id}
                              onOpenChange={(open) => !open && setActiveSheetUserId(null)}
                            >
                              <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9"
                                  onClick={() => setActiveSheetUserId(user._id)}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="bottom" className="rounded-t-2xl">
                                {/* User header */}
                                <SheetHeader className="mb-4 text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                                      {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <SheetTitle className="text-base truncate">{user.username}</SheetTitle>
                                      <SheetDescription className="text-xs truncate">{user.email}</SheetDescription>
                                    </div>
                                    <Badge variant={roleBadgeVariant(user.role)} className="ml-auto shrink-0">
                                      {roleLabel(user.role)}
                                    </Badge>
                                  </div>
                                </SheetHeader>

                                {/* Role selection */}
                                {user.role !== "root" && (
                                  <>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                      Cambiar rol
                                    </p>
                                    <div className="space-y-1 mb-4">
                                      {(["read", "write", "admin"] as const).map((role) => (
                                        <button
                                          key={role}
                                          onClick={() => {
                                            if (user.role !== role) handleRoleChange(user._id, role);
                                            setActiveSheetUserId(null);
                                          }}
                                          disabled={processingUserId === user._id}
                                          className={cn(
                                            "flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm transition-colors text-left",
                                            user.role === role
                                              ? "bg-muted"
                                              : "hover:bg-muted/50 active:bg-muted"
                                          )}
                                        >
                                          <Badge variant={roleBadgeVariant(role)} className="shrink-0">
                                            {roleLabel(role)}
                                          </Badge>
                                          <span className="text-muted-foreground">{roleDesc(role)}</span>
                                          {user.role === role && (
                                            <span className="ml-auto h-2 w-2 rounded-full bg-foreground shrink-0" />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                    <Separator className="mb-4" />
                                  </>
                                )}

                                {/* Status actions */}
                                {(user.role !== "admin" && user.role !== "root") || isRoot ? (
                                  user.isActive ? (
                                    <Button
                                      variant="outline"
                                      className="w-full mb-2 text-warning border-warning/40 hover:bg-warning/10"
                                      onClick={() => { handleDeactivate(user._id); setActiveSheetUserId(null); }}
                                      disabled={processingUserId === user._id}
                                    >
                                      <UserMinus className="h-4 w-4 mr-2" />
                                      Desactivar usuario
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      className="w-full mb-2 text-success border-success/40 hover:bg-success/10"
                                      onClick={() => { handleReactivate(user._id); setActiveSheetUserId(null); }}
                                      disabled={processingUserId === user._id}
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Reactivar usuario
                                    </Button>
                                  )
                                ) : null}

                                {isRoot && (
                                  <>
                                    <Separator className="my-2" />
                                    <Button
                                      variant="outline"
                                      className="w-full text-destructive border-destructive/40 hover:bg-destructive/10"
                                      onClick={() => openDeleteModal(user._id, user.username)}
                                      disabled={processingUserId === user._id}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar permanentemente
                                    </Button>
                                  </>
                                )}
                              </SheetContent>
                            </Sheet>
                          </div>

                          {/* ── Desktop: DropdownMenu ─────────────────── */}
                          <div className="hidden md:flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                {user.role !== "root" && (
                                  <>
                                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                                      Cambiar rol
                                    </DropdownMenuLabel>
                                    <DropdownMenuRadioGroup
                                      value={user.role}
                                      onValueChange={(newRole) => handleRoleChange(user._id, newRole)}
                                    >
                                      {(["read", "write", "admin"] as const).map((role) => (
                                        <DropdownMenuRadioItem key={role} value={role}>
                                          <Badge variant={roleBadgeVariant(role)} className="text-xs mr-1">
                                            {roleLabel(role)}
                                          </Badge>
                                        </DropdownMenuRadioItem>
                                      ))}
                                    </DropdownMenuRadioGroup>
                                    <DropdownMenuSeparator />
                                  </>
                                )}

                                {(user.role !== "admin" && user.role !== "root") || isRoot ? (
                                  user.isActive ? (
                                    <DropdownMenuItem
                                      onClick={() => handleDeactivate(user._id)}
                                      className="text-warning focus:text-warning focus:bg-warning/10"
                                    >
                                      <UserMinus className="h-4 w-4" />
                                      Desactivar
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleReactivate(user._id)}
                                      className="text-success focus:text-success focus:bg-success/10"
                                    >
                                      <UserCheck className="h-4 w-4" />
                                      Reactivar
                                    </DropdownMenuItem>
                                  )
                                ) : null}

                                {isRoot && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openDeleteModal(user._id, user.username)}
                                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Eliminar permanentemente
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Roles Info Dialog */}
      <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Roles de Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {[
              { role: "read",  desc: "Solo lectura. Puede ver información pero no modificarla." },
              { role: "write", desc: "Puede crear y editar contenido propio." },
              { role: "admin", desc: "Acceso completo, incluyendo gestión de usuarios." },
              { role: "root",  desc: "Superadministrador con capacidad de eliminación permanente de usuarios y todos sus datos." },
            ].map(({ role, desc }) => (
              <div key={role} className="flex gap-3 items-start">
                <Badge variant={roleBadgeVariant(role)} className="shrink-0 mt-0.5">
                  {roleLabel(role)}
                </Badge>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Modal */}
      {permanentDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {permanentDeleteModal.step === "warning" && (
              <>
                <div className="bg-destructive px-6 py-4">
                  <h2 className="text-lg font-bold text-destructive-foreground">
                    Eliminar usuario permanentemente
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-sm font-semibold text-destructive mb-2">
                      ADVERTENCIA: Esta acción es IRREVERSIBLE
                    </p>
                    <p className="text-sm text-destructive/80 mb-3">
                      Estás a punto de eliminar permanentemente al usuario{" "}
                      <span className="font-bold">{permanentDeleteModal.username}</span> y
                      TODOS sus datos asociados, incluyendo:
                    </p>
                    <ul className="text-sm text-destructive/80 list-disc list-inside space-y-1">
                      <li>Todos sus vehículos registrados</li>
                      <li>Todas sus rutas y kilometraje</li>
                      <li>Todos sus registros de recargas de combustible</li>
                      <li>Todos sus registros de mantenimiento</li>
                      <li>Todos sus gastos registrados</li>
                    </ul>
                    <p className="text-sm font-semibold text-destructive mt-3">
                      No hay forma de recuperar esta información una vez eliminada.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => { setPermanentDeleteModal(null); setDeleteCode(""); setDeleteConfirmWord(""); }}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleRequestDeleteCode} disabled={sendingCode}>
                      {sendingCode ? "Enviando..." : "Enviar código de verificación"}
                    </Button>
                  </div>
                </div>
              </>
            )}
            {permanentDeleteModal.step === "confirm" && (
              <>
                <div className="bg-destructive px-6 py-4">
                  <h2 className="text-lg font-bold text-destructive-foreground">
                    Confirmar eliminación permanente
                  </h2>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Se ha enviado un código de 6 dígitos a tu correo. Ingrésalo y escribe{" "}
                    <span className="font-bold text-destructive">ELIMINAR</span> para confirmar.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="delete-code">Código de verificación</Label>
                    <Input
                      id="delete-code"
                      type="text"
                      value={deleteCode}
                      onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg font-mono tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-word">
                      Escribe <span className="font-bold text-destructive">ELIMINAR</span>
                    </Label>
                    <Input
                      id="confirm-word"
                      type="text"
                      value={deleteConfirmWord}
                      onChange={(e) => setDeleteConfirmWord(e.target.value)}
                      placeholder="ELIMINAR"
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-1">
                    <Button variant="outline" onClick={() => { setPermanentDeleteModal(null); setDeleteCode(""); setDeleteConfirmWord(""); }}>
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmPermanentDelete}
                      disabled={
                        deleteCode.length !== 6 ||
                        deleteConfirmWord !== "ELIMINAR" ||
                        processingUserId === permanentDeleteModal.userId
                      }
                    >
                      {processingUserId === permanentDeleteModal.userId
                        ? "Eliminando..."
                        : "Confirmar eliminación permanente"}
                    </Button>
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
