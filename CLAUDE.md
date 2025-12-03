# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kilometracker v2 is a Next.js 16 application for comprehensive vehicle management. The app allows users to:
- Register and manage multiple vehicles
- Track routes/trips and mileage
- Monitor fuel consumption and efficiency
- Manage vehicle maintenance records (oil changes, repairs, inspections, etc.)
- Manage vehicle expenses (insurance, taxes, parking, etc.)
- Analyze fuel efficiency metrics (km/liter, km/gallon, cost per km)
- Track total cost of ownership
- Manage recurring expenses and tax-deductible items
- Schedule and track upcoming maintenance
- Admin users can manage user accounts and permissions

## Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Architecture

### Frontend Architecture
- **Framework**: Next.js 16 with App Router (React 19.2)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **Compiler**: React Compiler enabled (babel-plugin-react-compiler)
- **Font**: Geist (Google Fonts via next/font)

### Backend Integration
The frontend acts as a BFF (Backend for Frontend) proxy to an external API:
- Backend API URL is configured in `.env.local` via `API_BASE_URL`
- All API routes in `src/app/api/` are proxy handlers that forward requests to the backend
- Authentication uses JWT tokens stored in HTTP-only cookies
- Role-based access control: `read`, `write`, `admin` roles
- Backend uses soft delete pattern for users (sets `isActive: false` instead of hard deletion)

### Project Structure
```
src/
├── app/                          # Next.js App Router pages & API routes
│   ├── page.tsx                  # Login page (root route)
│   ├── layout.tsx                # Root layout with Geist fonts
│   ├── dashboard/                # Main dashboard (lists vehicles)
│   ├── add-vehicle/              # Add new vehicle form
│   ├── edit-vehicle/[alias]/     # Edit vehicle by alias
│   ├── vehicle-stats/[alias]/    # View vehicle statistics
│   ├── fuel-analysis/[alias]/    # Fuel consumption analysis
│   ├── add-route/                # Log new route/trip
│   ├── add-refuel/               # Log fuel refill
│   ├── routes-history/           # View all routes
│   ├── refuels-history/          # View all refuels
│   ├── add-maintenance/          # Add maintenance record
│   ├── maintenance-history/      # View and filter maintenance records
│   ├── upcoming-maintenance/     # View upcoming/overdue maintenance
│   ├── add-expense/              # Add new expense form
│   ├── expenses-history/         # View and filter all expenses
│   ├── expenses-summary/         # Expense dashboard with category breakdown
│   ├── upcoming-expenses/        # View recurring expenses due soon
│   ├── profile/                  # User profile settings + password change
│   ├── register/                 # User registration
│   ├── admin-users/              # Admin panel for user management (admin only)
│   └── api/                      # API proxy routes (all .js files)
│       ├── auth/                 # Authentication endpoints
│       │   ├── login/            # User login
│       │   ├── logout/           # User logout
│       │   ├── register/         # User registration
│       │   ├── me/               # Get current user
│       │   ├── updateprofile/    # Update user profile
│       │   ├── updatepassword/   # Change password
│       │   └── users/            # Admin user management
│       │       ├── route.js      # List users (GET)
│       │       └── [id]/         # User operations by ID
│       │           ├── route.js  # Get/Delete/Reactivate user
│       │           └── role/     # Change user role (PUT)
│       ├── vehicles/             # Vehicle CRUD operations + stats + fuel efficiency
│       │   └── [alias]/
│       │       ├── stats/        # Comprehensive vehicle statistics
│       │       ├── fuel-efficiency/  # Fuel efficiency metrics
│       │       └── reactivate/   # Reactivate deactivated vehicle
│       ├── routes/               # Route tracking endpoints
│       ├── refuels/              # Refuel tracking endpoints
│       ├── maintenance/          # Maintenance tracking endpoints
│       │   ├── route.js          # List/Create maintenance (GET/POST)
│       │   ├── [id]/             # Get/Update/Delete maintenance
│       │   └── upcoming/         # Maintenance due soon
│       └── expenses/             # Expense management endpoints
│           ├── route.js          # List/Create expenses (GET/POST)
│           ├── [id]/             # Get/Update/Delete expense
│           ├── summary/          # Aggregated spending by category
│           └── upcoming/         # Recurring expenses due soon
└── Types.ts                      # Shared TypeScript interfaces

middleware.js                     # Auth middleware (redirects based on token)
```

### Key Architecture Patterns

**1. API Proxy Pattern**
All API routes (`src/app/api/**/route.js`) follow this pattern:
- Extract JWT token from cookies using Next.js `cookies()` helper
- Validate token presence (return 401 if missing)
- Forward request to external backend API with `Authorization: Bearer ${token}` header
- Return backend response to frontend

**2. Vehicle Identification**
Vehicles are identified by `alias` (unique string) rather than database ID in URLs and API calls. This is used throughout routing: `/edit-vehicle/[alias]`, `/vehicle-stats/[alias]`, etc.

**3. Authentication Flow**
- Login → Token stored in HTTP-only cookie → Middleware checks token
- Middleware (`middleware.js`) protects `/dashboard/*` and `/admin-users/*` routes
- Redirects authenticated users from `/` to `/dashboard`
- Redirects unauthenticated users from protected routes to `/`
- Admin-only pages verify user role on client-side and redirect non-admins to `/dashboard`

**4. Type Safety**
All entity types are defined in `src/Types.ts`:
- Core entities: `Vehicle`, `Route`, `Refuel`, `Maintenance`, `Expense`, `User`
- Analytics: `VehicleStats`, `FuelAnalysis`, `ExpenseSummary`
- Form data types: `AddVehicleFormData`, `EditVehicleFormData`, `AddMaintenanceFormData`, etc.
- All form data types use strings for numeric fields (converted before API submission)

**5. Client Components**
All page components use `"use client"` directive for interactive features (forms, state management, routing). The app does not use Server Components for data fetching; instead it uses client-side `fetch()` calls to `/api/*` routes.

**6. Context-Based State Management**
The application uses React Context for global state management:

- **UserContext** (`src/contexts/UserContext.tsx`): Manages user authentication state
  - Fetches user data from `/api/auth/me` on mount
  - Provides: `user`, `isLoading`, `error`, `isAdmin`, `isAuthenticated`, `refreshUser()`
  - Secured by server-validated JWT tokens (no localStorage manipulation)
  - Use via `useUser()` hook
  - Integrated in dashboard layout as outermost provider

- **VehicleContext** (`src/contexts/VehicleContext.tsx`): Manages vehicle data
  - Fetches active vehicles from `/api/vehicles`
  - Provides: `vehicles`, `selectedVehicle`, `setSelectedVehicle`, `isLoading`, `error`, `refreshVehicles()`
  - Filters to show only active vehicles
  - Use via `useVehicle()` hook

- **SidebarContext** (`src/contexts/SidebarContext.tsx`): Manages sidebar collapse state
  - Persists state to localStorage
  - Syncs across tabs using storage events
  - Use via `useSidebar()` hook

**7. Navigation Badge Counts**
The navigation displays real-time badge counts for upcoming items:

- **useUpcomingCounts Hook** (`src/hooks/useUpcomingCounts.ts`):
  - Fetches counts from `/api/maintenance/upcoming` and `/api/expenses/upcoming`
  - Returns: `{ maintenanceCount, expensesCount, isLoading, error }`
  - Auto-refreshes every 5 minutes
  - Gracefully handles errors (returns 0 on failure)
  - Used in both Sidebar and SidebarDrawer components

- Badge counts display on:
  - "Próximos servicios" (upcoming maintenance)
  - "Gastos recurrentes" (recurring expenses)

**8. Fuel Analysis Routes**
The fuel analysis feature has two routes:

- `/fuel-analysis` - Generic landing page (NEW)
  - Shows vehicle selector when no vehicle is selected
  - Auto-redirects to first vehicle if vehicles exist
  - Shows "Add Vehicle" prompt if no vehicles registered
  - Uses VehicleContext for vehicle data

- `/fuel-analysis/[alias]` - Vehicle-specific analysis page
  - Displays fuel consumption metrics for specific vehicle
  - Fetches data from `/api/refuels/vehicle/${alias}/analysis`

**9. Reusable UI Components**

- **EmptyState** (`src/components/ui/empty-state.tsx`):
  - Consistent empty state UI across all pages
  - Props: `icon`, `title`, `description`, `action?`
  - Action can have `onClick` or `href`
  - Example usage:
    ```tsx
    <EmptyState
      icon={<Car className="h-12 w-12" />}
      title="No vehicles registered"
      description="Add your first vehicle to start tracking"
      action={{
        label: "Add Vehicle",
        onClick: () => router.push("/add-vehicle")
      }}
    />
    ```

- **VehicleCardSkeleton** (`src/components/ui/vehicle-card-skeleton.tsx`):
  - Loading skeleton matching VehicleCard layout
  - Prevents layout shift during loading
  - Used in dashboard grid (4 skeleton cards)
  - Based on shadcn/ui Skeleton component

**10. Loading State Pattern**
Dashboard and other pages use skeleton loading states:
- Show full page layout with skeleton components during loading
- Maintains PageHeader and layout structure
- Uses VehicleCardSkeleton for vehicle grid
- Prevents jarring layout shifts

## Backend API Endpoints

The backend provides these endpoints (accessed through frontend proxy routes):

### Authentication & User Management
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout (clears token)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updateprofile` - Update user profile (username, email)
- `PUT /api/auth/updatepassword` - Change password (requires current password)

### Admin-Only User Management
These endpoints require `admin` role:
- `GET /api/auth/users` - List all users (supports `?isActive=true/false` filter)
- `GET /api/auth/users/:id` - View specific user details
- `PUT /api/auth/users/:id/role` - Update user role (`read`, `write`, `admin`)
- `DELETE /api/auth/users/:id` - **Deactivate user (soft delete - sets isActive to false, cannot deactivate self)**
- `PATCH /api/auth/users/:id/reactivate` - Reactivate deactivated user

### Vehicles
- `GET /api/vehicles` - List all vehicles (supports `?isActive` param)
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/:alias` - Get vehicle by alias
- `PUT /api/vehicles/:alias` - Update vehicle
- `DELETE /api/vehicles/:alias` - **Deactivate vehicle (soft delete - sets isActive to false)**
- `GET /api/vehicles/:alias/stats` - Comprehensive vehicle statistics (routes, refuels, maintenance, expenses, efficiency metrics, total cost of ownership, cost per km)
- `GET /api/vehicles/:alias/fuel-efficiency` - Calculate fuel efficiency (km/liter, km/gallon, cost per km). Supports `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `PATCH /api/vehicles/:alias/reactivate` - Reactivate deactivated vehicle

### Routes (Trips)
- `GET /api/routes` - List all routes
- `POST /api/routes` - Create new route
- `GET /api/routes/:id` - Get route by ID
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - **Delete route (PERMANENT DELETE - cannot be undone)**

### Refuels
- `GET /api/refuels` - List all refuels
- `POST /api/refuels` - Create new refuel record
- `GET /api/refuels/:id` - Get refuel by ID
- `PUT /api/refuels/:id` - Update refuel
- `DELETE /api/refuels/:id` - **Delete refuel (PERMANENT DELETE - cannot be undone)**
- `GET /api/refuels/vehicle/:alias/analysis` - Get fuel analysis for specific vehicle

### Maintenance
- `GET /api/maintenance` - List all maintenance records (supports filters: `?vehicleAlias`, `?tipo`, `?startDate`, `?endDate`)
- `POST /api/maintenance` - Create new maintenance record
- `GET /api/maintenance/:id` - Get maintenance by ID
- `PUT /api/maintenance/:id` - Update maintenance
- `DELETE /api/maintenance/:id` - **Delete maintenance (PERMANENT DELETE - cannot be undone)**
- `GET /api/maintenance/upcoming` - Maintenance due soon (by date or km)

**Maintenance Types**: Cambio de aceite, Rotación de llantas, Frenos, Inspección, Reparación, Batería, Filtros, Transmisión, Suspensión, Alineación, Otro
**Maintenance Features**: Track by date and/or kilometraje, schedule next service, provider tracking
**Important**: Maintenance uses permanent delete (no soft delete)

### Expenses
- `GET /api/expenses` - List all expenses (supports filters: `?vehicleAlias`, `?category`, `?startDate`, `?endDate`, `?taxDeductible=true/false`)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - **Delete expense (PERMANENT DELETE - cannot be undone)**
- `GET /api/expenses/summary` - Aggregated spending by category
- `GET /api/expenses/upcoming` - Recurring expenses due in next 30 days

**Expense Categories**: Seguro, Impuestos, Registro, Estacionamiento, Peajes, Lavado, Multas, Financiamiento, Otro
**Expense Features**: Recurring expenses (Mensual, Trimestral, Semestral, Anual), tax-deductible tracking, next payment date
**Important**: Expenses use permanent delete (no soft delete)

## Configuration

### Environment Variables
Required in `.env.local`:
```
API_BASE_URL=https://your-backend-url.com
```

### TypeScript Paths
`@/*` imports map to `./src/*` (configured in `tsconfig.json`)

### ESLint
Uses Next.js recommended config with TypeScript support (`eslint.config.mjs`)

### React Compiler
Enabled in `next.config.ts` with `reactCompiler: true`

## Important Enums and Constants

### Fuel Types (tipoCombustible)
Supported fuel types: `Regular`, `Premium`, `Diesel`, `Eléctrico`, `Híbrido`, `V-Power`

### Maintenance Types (tipo)
Supported types: `Cambio de aceite`, `Rotación de llantas`, `Frenos`, `Inspección`, `Reparación`, `Batería`, `Filtros`, `Transmisión`, `Suspensión`, `Alineación`, `Otro`

### Expense Categories (categoria)
Supported categories: `Seguro`, `Impuestos`, `Registro`, `Estacionamiento`, `Peajes`, `Lavado`, `Multas`, `Financiamiento`, `Otro`

### Recurrence Frequencies (frecuenciaRecurrencia)
Supported frequencies: `Mensual`, `Trimestral`, `Semestral`, `Anual`
