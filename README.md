# KilomeTracker — Frontend

> Aplicación web mobile-first para gestión vehicular: kilómetros, combustible, mantenimiento y gastos.

![Estado](https://img.shields.io/badge/estado-en%20producci%C3%B3n-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue)

**Demo:** [kilometracker.vercel.app](https://kilometracker.vercel.app)

---

## ¿Qué es KilomeTracker?

KilomeTracker es una aplicación web de gestión vehicular orientada al mercado guatemalteco. Permite a conductores individuales y flotas pequeñas llevar un control completo de sus vehículos: kilómetros recorridos, consumo de combustible, historial de mantenimientos y todos los gastos asociados al vehículo.

La app está diseñada con un enfoque **mobile-first** — la experiencia principal está pensada para el celular, con tarjetas de datos deslizables, filtros en bottom sheet y navegación inferior. En desktop escala a tablas y sidebar.

Este repositorio es el frontend construido con Next.js 16 (App Router) que se conecta al [backend Express/MongoDB](../kilometracker-backend) mediante un patrón BFF (Backend for Frontend): todas las llamadas a la API pasan por rutas proxy de Next.js que mantienen el JWT en cookies HTTP-only, fuera del alcance de JavaScript del cliente.

---

## Funcionalidades

- 🚗 **Dashboard de vehículos** — grid con métricas clave: km totales, estado activo, acceso rápido
- 📋 **Historiales completos** — rutas, recargas, mantenimientos y gastos con filtros y paginación
- ⛽ **Análisis de combustible** — eficiencia (km/litro, km/galón, costo/km) con gráficas interactivas
- 🔧 **Recordatorios de mantenimiento** — próximos servicios por fecha o kilometraje
- 💰 **Resumen de gastos** — desglose por categoría con gráfica donut, deducibles fiscales
- 👥 **Panel de administración** — gestión de usuarios y roles (solo visible para admins)
- 🌙 **Modo oscuro nativo** y diseño responsive (mobile cards / desktop tablas)

---

## Stack técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | ^16.1.7 |
| UI Library | React | ^19.2.1 |
| Lenguaje | TypeScript (strict) | ^5 |
| Estilos | Tailwind CSS | v4 |
| Componentes | shadcn/ui + Radix UI | — |
| Formularios | React Hook Form + Zod | ^7.66 / ^4.1.13 |
| Charts | Recharts | ^2.15.3 |
| Iconos | lucide-react | ^0.555.0 |
| Tests unitarios | Vitest | ^3 |
| Tests e2e | Playwright | ^1.49.0 |
| Compiler | React Compiler (babel-plugin) | 1.0.0 |
| Package manager | npm | — |
| Deploy | Vercel | — |

---

## Prerrequisitos

- **Node.js** >= 18
- **npm**
- **Backend KilomeTracker** corriendo (local o en producción) — ver [kilometracker-backend](../kilometracker-backend)

---

## Setup local

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repo>
   cd kilometracker-front
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Crea el archivo de entorno:**
   ```bash
   cp .env.example .env.local
   # o crea .env.local manualmente
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La app estará disponible en `http://localhost:3000`.

---

## Variables de entorno

```env
# .env.local

# URL base del backend KilomeTracker (sin slash final)
API_BASE_URL=https://tu-backend-url.com
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                      # Login
│   ├── register/                     # Registro de usuario
│   ├── forgot-password/              # Recuperar contraseña
│   ├── reset-password/[token]/       # Resetear contraseña
│   └── (dashboard)/                  # Rutas protegidas
│       ├── dashboard/                # Grid de vehículos
│       ├── add-vehicle/
│       ├── edit-vehicle/[alias]/
│       ├── vehicle-stats/[alias]/    # Estadísticas completas
│       ├── fuel-analysis/[alias]/    # Análisis de combustible
│       ├── add-route/
│       ├── routes-history/
│       ├── add-refuel/
│       ├── refuels-history/
│       ├── add-maintenance/
│       ├── edit-maintenance/[id]/
│       ├── maintenance-history/
│       ├── upcoming-maintenance/     # Próximos servicios
│       ├── add-expense/
│       ├── edit-expense/[id]/
│       ├── expenses-history/
│       ├── expenses-summary/         # Gráficas por categoría
│       ├── upcoming-expenses/        # Gastos recurrentes próximos
│       ├── profile/
│       └── admin-users/              # Panel admin (solo admin/root)
│   └── api/                          # Rutas proxy → backend
├── components/
│   ├── ui/                           # shadcn/ui + componentes custom
│   ├── charts/                       # Recharts (Donut, Bar, Line, Area)
│   ├── navigation/                   # Sidebar, SidebarDrawer, BottomNav
│   └── layout/                       # PageHeader
├── contexts/                         # UserContext, VehicleContext, SidebarContext
├── hooks/                            # useUpcomingCounts, useChartColors, useMediaQuery
└── Types.ts                          # Interfaces TypeScript compartidas
middleware.js                         # Protección de rutas (auth redirect)
```

---

## Tests

```bash
npm test                  # Vitest (unit tests)
npx playwright test       # Tests e2e
```

---

## Documentación técnica

Para información detallada sobre arquitectura, patrones de diseño, sistema de componentes, convenciones mobile-first y roadmap, ver **[PRD.md](./PRD.md)**.

---

## Repo relacionado

**[kilometracker-backend](../kilometracker-backend)** — API REST Express + MongoDB que alimenta esta aplicación.
