# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kilometracker v2 is a Next.js 16 application for tracking vehicle mileage and fuel consumption. The app allows users to register vehicles, log routes, track fuel refills, and analyze vehicle statistics.

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
│       ├── vehicles/             # Vehicle CRUD operations
│       ├── routes/               # Route tracking endpoints
│       └── refuels/              # Refuel tracking endpoints
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
- Core entities: `Vehicle`, `Route`, `Refuel`, `User`
- Analytics: `VehicleStats`, `FuelAnalysis`
- Form data types: `AddVehicleFormData`, `EditVehicleFormData`, etc.
- All form data types use strings for numeric fields (converted before API submission)

**5. Client Components**
All page components use `"use client"` directive for interactive features (forms, state management, routing). The app does not use Server Components for data fetching; instead it uses client-side `fetch()` calls to `/api/*` routes.

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
- `DELETE /api/auth/users/:id` - Deactivate user (soft delete, cannot deactivate self)
- `PATCH /api/auth/users/:id/reactivate` - Reactivate deactivated user

### Vehicles
- `GET /api/vehicles` - List all vehicles (supports `?isActive` and `?includeInactive` params)
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/:alias` - Get vehicle by alias
- `PUT /api/vehicles/:alias` - Update vehicle
- `DELETE /api/vehicles/:alias` - Delete vehicle
- `GET /api/vehicles/:alias/stats` - Get vehicle statistics (total routes, distance, fuel costs)

### Routes (Trips)
- `GET /api/routes` - List all routes
- `POST /api/routes` - Create new route
- `GET /api/routes/:id` - Get route by ID
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route

### Refuels
- `GET /api/refuels` - List all refuels
- `POST /api/refuels` - Create new refuel record
- `GET /api/refuels/:id` - Get refuel by ID
- `PUT /api/refuels/:id` - Update refuel
- `DELETE /api/refuels/:id` - Delete refuel
- `GET /api/refuels/vehicle/:alias/analysis` - Get fuel analysis for specific vehicle

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
