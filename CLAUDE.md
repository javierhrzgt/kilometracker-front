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
│   ├── profile/                  # User profile settings
│   ├── register/                 # User registration
│   └── api/                      # API proxy routes (all .js files)
│       ├── auth/                 # Authentication endpoints
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
- Middleware (`middleware.js`) protects `/dashboard/*` routes
- Redirects authenticated users from `/` to `/dashboard`
- Redirects unauthenticated users from `/dashboard/*` to `/`

**4. Type Safety**
All entity types are defined in `src/Types.ts`:
- Core entities: `Vehicle`, `Route`, `Refuel`, `User`
- Analytics: `VehicleStats`, `FuelAnalysis`
- Form data types: `AddVehicleFormData`, `EditVehicleFormData`, etc.
- All form data types use strings for numeric fields (converted before API submission)

**5. Client Components**
All page components use `"use client"` directive for interactive features (forms, state management, routing). The app does not use Server Components for data fetching; instead it uses client-side `fetch()` calls to `/api/*` routes.

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
