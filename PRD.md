# PRD — KilomeTracker Frontend (v2)

**Repo:** `kilometracker-front/`
**Fecha de redacción:** 2026-03-30
**Estado:** En progreso

---

## 1. Propósito

Documentar el estado actual, las decisiones de diseño y el trabajo pendiente del frontend de KilomeTracker. Este archivo es la fuente de verdad para cualquier agente o desarrollador que trabaje en `kilometracker-front/`.

---

## 2. Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | ^16.1.7 |
| UI Library | React | ^19.2.1 |
| Lenguaje | TypeScript | ^5 (strict) |
| Estilos | Tailwind CSS | v4 |
| Componentes | shadcn/ui + Radix UI | — |
| Formularios | React Hook Form + Zod | ^7.66 / ^4.1.13 |
| Charts | Recharts | ^2.15.3 |
| Iconos | lucide-react | ^0.555.0 |
| Fechas | date-fns + react-day-picker | ^4.1.0 / ^9.11.2 |
| Tests unitarios | Vitest + @vitest/coverage-v8 | ^3 |
| Tests e2e | Playwright | ^1.49.0 |
| Compiler | React Compiler (babel-plugin) | 1.0.0 |
| Package manager | npm | — |
| Deploy | Vercel | — |

---

## 3. Variables de entorno requeridas

```env
# .env.local
API_BASE_URL=https://your-backend-url.com
```

---

## 4. Arquitectura

### 4.1 Patrón BFF (Backend for Frontend)

El frontend actúa como proxy hacia el backend externo. Todos los archivos en `src/app/api/**/route.js` siguen este patrón:

1. Leer JWT del cookie HTTP-only con `cookies()` de Next.js.
2. Retornar 401 si no hay token.
3. Reenviar la request al backend con `Authorization: Bearer ${token}`.
4. Retornar la respuesta del backend al cliente.

Esto mantiene el token fuera del alcance de JavaScript del cliente (seguridad XSS).

### 4.2 Autenticación y middleware

- `middleware.js` en la raíz protege rutas `/dashboard/*` y `/admin-users/*`.
- Usuarios no autenticados son redirigidos a `/` (login).
- Usuarios autenticados que visitan `/` son redirigidos a `/dashboard`.
- Las páginas admin verifican el rol en el cliente y redirigen a `/dashboard` si no es admin.

### 4.3 Identificación de vehículos

Igual que el backend: los vehículos se identifican por `alias` (string único) en todas las URLs y llamadas API. Nunca por `_id`.

### 4.4 Gestión de estado global (Context)

| Context | Hook | Provee |
|---|---|---|
| `UserContext` | `useUser()` | `user`, `isLoading`, `isAdmin`, `isAuthenticated`, `refreshUser()` |
| `VehicleContext` | `useVehicle()` | `vehicles`, `selectedVehicle`, `setSelectedVehicle`, `isLoading`, `refreshVehicles()` |
| `SidebarContext` | `useSidebar()` | Estado de colapso del sidebar (persiste en localStorage, sincroniza entre tabs) |

Los providers se montan en el layout del dashboard (`src/app/(dashboard)/layout.tsx`).

### 4.5 Todos los componentes de página usan `"use client"`

No se usa Server Components para fetching. Los datos se obtienen con `fetch()` del cliente hacia las rutas `/api/*` del propio Next.js.

---

## 5. Estructura de archivos

```
src/
├── app/
│   ├── page.tsx                          # Login
│   ├── layout.tsx                        # Root layout (fuentes Geist)
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx          # Recuperar contraseña
│   ├── reset-password/[token]/page.tsx   # Resetear contraseña con token
│   └── (dashboard)/
│       ├── layout.tsx                    # Dashboard layout (UserContext + VehicleContext)
│       ├── dashboard/page.tsx            # Grid de vehículos
│       ├── add-vehicle/page.tsx
│       ├── edit-vehicle/[alias]/page.tsx
│       ├── vehicle-stats/[alias]/page.tsx
│       ├── fuel-analysis/page.tsx        # Selector de vehículo
│       ├── fuel-analysis/[alias]/page.tsx
│       ├── add-route/page.tsx
│       ├── add-refuel/page.tsx
│       ├── routes-history/page.tsx
│       ├── refuels-history/page.tsx
│       ├── add-maintenance/page.tsx
│       ├── edit-maintenance/[id]/page.tsx
│       ├── maintenance-history/page.tsx
│       ├── upcoming-maintenance/page.tsx
│       ├── add-expense/page.tsx
│       ├── edit-expense/[id]/page.tsx
│       ├── expenses-history/page.tsx
│       ├── expenses-summary/page.tsx
│       ├── upcoming-expenses/page.tsx
│       ├── profile/page.tsx
│       └── admin-users/page.tsx          # Solo admin
│   └── api/                              # Proxy routes (todos .js)
│       ├── auth/{login,logout,register,me,updateprofile,updatepassword}/
│       ├── auth/users/[id]/{route.js,role/}
│       ├── vehicles/[alias]/{stats,fuel-efficiency,reactivate}/
│       ├── routes/
│       ├── refuels/vehicle/[alias]/analysis/
│       ├── maintenance/{[id],upcoming}/
│       └── expenses/{[id],summary,upcoming}/
├── components/
│   ├── layout/PageHeader.tsx
│   ├── navigation/{NavGroup,NavItem,VehicleSwitcher}.tsx
│   ├── charts/
│   │   ├── ExpenseDonutChart.tsx
│   │   ├── FuelBarChart.tsx
│   │   ├── FuelComposedChart.tsx
│   │   ├── FuelEfficiencyLineChart.tsx
│   │   └── KmAreaChart.tsx
│   └── ui/
│       ├── FilterPanel.tsx               # Mobile: Sheet; Desktop: Card con grid
│       ├── empty-state.tsx
│       ├── vehicle-card-skeleton.tsx
│       ├── card-skeleton.tsx
│       ├── badge.tsx                     # Con variantes semánticas
│       ├── stat-card.tsx                 # Con accents tipados
│       └── [otros shadcn/ui components]
├── contexts/
│   ├── UserContext.tsx
│   ├── VehicleContext.tsx
│   └── SidebarContext.tsx
├── hooks/
│   ├── useUpcomingCounts.ts              # Badge counts para nav (refresh 5 min)
│   └── useChartColors.ts                 # Colores de charts adaptados a dark mode
└── Types.ts                              # Interfaces TypeScript compartidas
middleware.js                             # Auth routing
```

---

## 6. Convenciones de diseño (mobile-first)

La app se usa principalmente en dispositivos móviles. Todas las decisiones de UI deben seguir estas reglas:

### 6.1 Layouts

- Diseñar para mobile primero, escalar a desktop con breakpoints (`md:`, `lg:`).
- Touch targets mínimo 44x44px.
- Botones de acción en listas: `h-8 w-8` (icono solamente en mobile).

### 6.2 Navegación

- Sidebar colapsable en desktop.
- En mobile: considerar bottom navigation bar como alternativa futura al sidebar.

### 6.3 Filtros

- Usar siempre `FilterPanel` (`src/components/ui/FilterPanel.tsx`).
- Mobile: renderiza botón "Filtros" + badge de filtros activos + Sheet desde abajo.
- Desktop: renderiza Card con header + grid de campos + botón Aplicar.
- Nunca filtros inline en mobile.

### 6.4 Historial / listas con datos

```tsx
{/* Mobile — block md:hidden */}
<div className="block md:hidden space-y-3">
  {items.map((item) => (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* header: nombre + badges */}
      {/* body: valor principal + metadata secundaria */}
    </div>
  ))}
</div>

{/* Desktop — hidden md:block */}
<div className="hidden md:block">
  <Card><Table>...</Table></Card>
</div>
```

### 6.5 Loading state

Siempre usar `CardSkeleton`:

```tsx
import { CardSkeleton } from "@/components/ui/card-skeleton";
{loading ? <CardSkeleton rows={6} /> : /* contenido */}
```

### 6.6 Formularios

Full-screen o bottom sheet en mobile. Nunca modal comprimido.

### 6.7 Charts

Siempre responsivos (`ResponsiveContainer`) y touch-friendly. Usar `useChartColors()` para respetar dark mode.

---

## 7. Sistema de diseño

### 7.1 StatCard — accents

| Accent | Uso |
|---|---|
| `info` (azul) | Combustible / fuel |
| `warning` (amber) | Mantenimiento / costo total |
| `purple` | Otros gastos |
| `success` (verde) | Estado activo / deducible / éxito |
| Sin accent | Total general o métrica neutral |

### 7.2 Badge — variantes semánticas

| Variante | Uso |
|---|---|
| `success` | Activo / deducible |
| `warning` | Mantenimiento / costo |
| `info` | Categoría de gasto / rol write |
| `purple` | Rol admin |
| `muted` | Inactivo / rol read |
| `destructive` | Rol root |

### 7.3 Botones CTA

```tsx
<Button onClick={() => router.push("/add-route")}>
  <Plus className="h-4 w-4 mr-2" />
  Agregar Ruta
</Button>
```

Siempre: icono `<Plus>` + "Agregar [Entidad]".

### 7.4 Colores de charts (dark mode)

```tsx
const c = useChartColors();
// c.chart1 indigo, c.chart2 verde, c.chart3 naranja, c.chart4 purple, c.chart5 rojo
// c.grid, c.tick, c.tooltipBg, c.tooltipBorder
```

### 7.5 Tokens de dominio (globals.css)

```
--color-cat-fuel         → accent="info"
--color-cat-maintenance  → accent="warning"
--color-cat-expenses     → accent="purple"
--color-role-root        → Badge destructive
--color-role-admin       → Badge purple
--color-role-write       → Badge info
--color-role-read        → Badge muted
--color-status-active    → Badge success
--color-status-inactive  → Badge muted
--color-status-overdue   → Badge destructive
```

---

## 8. Enums y constantes del dominio

### Tipos de combustible (`tipoCombustible`)
`Regular`, `Premium`, `Diesel`, `Eléctrico`, `Híbrido`, `V-Power`

### Tipos de mantenimiento (`tipo`)
`Cambio de aceite`, `Rotación de llantas`, `Frenos`, `Inspección`, `Reparación`, `Batería`, `Filtros`, `Transmisión`, `Suspensión`, `Alineación`, `Otro`

### Categorías de gastos (`categoria`)
`Seguro`, `Impuestos`, `Registro`, `Estacionamiento`, `Peajes`, `Lavado`, `Multas`, `Financiamiento`, `Otro`

### Frecuencias de recurrencia (`frecuenciaRecurrencia`)
`Mensual`, `Trimestral`, `Semestral`, `Anual`

### Roles de usuario
`read`, `write`, `admin` (root existe en BD pero no se gestiona desde la UI)

---

## 9. Estado actual por funcionalidad

| Funcionalidad | Estado | Notas |
|---|---|---|
| Login / Logout | Implementado | JWT en cookie HTTP-only |
| Registro | Implementado | |
| Recuperar / resetear contraseña | Implementado (UI) | El backend aún no tiene el endpoint — P0 |
| Dashboard de vehículos | Implementado | Skeleton loading, EmptyState |
| CRUD vehículos | Implementado | |
| Historial de rutas | Implementado | Card mobile / tabla desktop |
| Historial de recargas | Implementado | |
| Historial de mantenimientos | Implementado | |
| Historial de gastos | Implementado | |
| Stats de vehículo | Implementado | |
| Análisis de combustible | Implementado | |
| Resumen de gastos | Implementado | |
| Próximos mantenimientos | Implementado | |
| Próximos gastos recurrentes | Implementado | |
| Perfil de usuario | Implementado | |
| Admin — gestión de usuarios | Implementado | Solo visible con rol admin |
| Charts (Recharts) | Implementado | ExpenseDonut, FuelBar, FuelComposed, FuelEfficiencyLine, KmArea |
| Formularios con RHF + Zod | Parcial | Instalados pero migración pendiente en algunos formularios |
| Tests (Vitest) | Pendiente | Setup presente, tests por escribir |
| Tests e2e (Playwright) | Pendiente | Setup presente, tests por escribir |

---

## 10. Trabajo pendiente (roadmap priorizado)

### P0 — Password reset funcional (bloqueado por backend)

- [ ] Verificar que `/forgot-password/page.tsx` llame a `POST /api/auth/forgotpassword`
- [ ] Verificar que `/reset-password/[token]/page.tsx` llame a `PUT /api/auth/resetpassword/:token`
- [ ] Agregar rutas proxy `src/app/api/auth/forgotpassword/route.js` y `src/app/api/auth/resetpassword/[token]/route.js`
- [ ] Conectar con el backend una vez que el endpoint esté implementado

### P1 — Migración completa de formularios a RHF + Zod

- [ ] Auditar qué formularios aún usan `useState` para campos controlados
- [ ] Migrar cada formulario a `useForm<Schema>({ resolver: zodResolver(schema) })`
- [ ] Definir schemas Zod en un archivo por dominio (ej. `src/schemas/vehicle.ts`)
- [ ] Aprovechar el componente `<Form>` de shadcn/ui ya instalado en `src/components/ui/form.tsx`

### P2 — Tests unitarios con Vitest

- [ ] Escribir tests para hooks: `useUpcomingCounts`, `useChartColors`
- [ ] Escribir tests para utils (si existen)
- [ ] Tests para componentes UI reutilizables (`FilterPanel`, `EmptyState`, `StatCard`)
- [ ] Coverage objetivo: 60% mínimo

### P3 — Tests e2e con Playwright

- [ ] Happy path de autenticación (login, logout, registro)
- [ ] Crear vehículo + agregar ruta + verificar `kilometrajeTotal`
- [ ] Flujo de mantenimiento: crear → ver en upcoming → marcar como completado

### P4 — Mejoras de UX mobile

- [ ] Evaluar bottom navigation bar para mobile (las 4-5 acciones más frecuentes)
- [ ] FAB (Speed Dial) para acciones de creación rápida
- [ ] Revisar formularios largos — considerar step-by-step en mobile

---

## 11. Rutas de TypeScript (`tsconfig.json`)

`@/*` mapea a `./src/*`. Usar siempre imports con `@/` en lugar de rutas relativas.

---

## 12. Configuración relevante

### next.config.ts
- `reactCompiler: true` habilitado.

### ESLint
- `eslint.config.mjs` con Next.js recommended + TypeScript.
- TypeScript en modo strict.

### Tailwind CSS v4
- No hay `tailwind.config.js` — la configuración está en `globals.css` usando la nueva sintaxis de v4.
- Los tokens de dominio están definidos como variables CSS custom en `globals.css`.

---

## 13. Convenciones de importación

```tsx
// Correcto
import { FilterPanel } from "@/components/ui/FilterPanel";
import { useUser } from "@/contexts/UserContext";
import type { Vehicle } from "@/Types";

// Evitar
import { FilterPanel } from "../../components/ui/FilterPanel";
```

---

## 14. Contexto de producción

- App desplegada en Vercel: `https://kilometracker.vercel.app`
- `API_BASE_URL` apunta al backend desplegado en Railway/Render.
- El middleware de Next.js maneja la protección de rutas sin llamadas extra al servidor.
