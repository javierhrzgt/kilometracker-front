// types.ts - Interfaces compartidas para toda la aplicación

export interface Vehicle {
  _id: string;
  alias: string;
  marca: string;
  modelo: number;
  plates: string;
  kilometrajeInicial: number;
  kilometrajeTotal: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  _id: string;
  vehicleAlias: string;
  distanciaRecorrida: number;
  fecha: string;
  notasAdicionales?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Refuel {
  _id: string;
  vehicleAlias: string;
  tipoCombustible: string;
  cantidadGastada: number;
  galones?: number;
  precioPorGalon?: number;
  fecha: string;
  notasAdicionales?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleStats {
  // Legacy fields (still supported)
  totalRoutes?: number;
  totalDistancia?: number;
  promedioDistanciaPorRuta?: number;
  totalRefuels?: number;
  totalGastoCombustible?: number;
  // Enhanced fields (from backend /api/vehicles/:alias/stats)
  vehicle?: Vehicle;
  statistics?: {
    totalRoutes: number;
    totalRefuels: number;
    totalMaintenances: number;
    totalExpenses: number;
    totalDistancia: number;
  };
  costs?: {
    combustible: number;
    mantenimiento: number;
    gastosOtros: number;
    total: number;
    costoPorKm: number;
  };
  efficiency?: {
    kmPorLitro: number;
    kmPorGalon: number;
    promedioDistanciaPorRuta: number;
  };
  // Additional computed fields
  totalCostOfOwnership?: number;
}

export interface FuelAnalysis {
  vehicle: Vehicle;
  summary: {
    totalReabastecimientos: number;
    totalGastado: number;
    totalGalones: number;
    promedioGalonPrice: number;
  };
  porTipoCombustible: {
    [key: string]: {
      cantidad: number;
      gasto: number;
      galones: number;
    };
  };
}

export interface AddVehicleFormData {
  alias: string;
  marca: string;
  modelo: number;
  plates: string;
  kilometrajeInicial: string;
  isActive: boolean;
}

export interface EditVehicleFormData {
  marca: string;
  modelo: number;
  plates: string;
  kilometrajeInicial: string;
  isActive: boolean;
}

export interface AddRouteFormData {
  vehicleAlias: string;
  distanciaRecorrida: string;
  fecha: string;
  notasAdicionales: string;
}

export interface AddRefuelFormData {
  vehicleAlias: string;
  tipoCombustible: string;
  cantidadGastada: string;
  galones: string;
  fecha: string;
  notasAdicionales: string;
}

export interface ProfileFormData {
  username: string;
  email: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface RouteFilters {
  vehicleAlias: string;
  startDate: string;
  endDate: string;
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Expense {
  _id: string;
  vehicleAlias: string;
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
  esRecurrente: boolean;
  frecuenciaRecurrencia?: string; // 'Mensual', 'Trimestral', 'Semestral', 'Anual'
  proximoPago?: string;
  esDeducibleImpuestos: boolean;
  notas?: string;
  owner?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddExpenseFormData {
  vehicleAlias: string;
  categoria: string;
  monto: string;
  descripcion: string;
  fecha: string;
  esRecurrente: boolean;
  frecuenciaRecurrencia: string;
  proximoPago: string;
  esDeducibleImpuestos: boolean;
}

export interface ExpenseSummary {
  _id: string; // categoria name from backend grouping
  totalMonto: number;
  cantidad: number;
}

export interface UpcomingExpense {
  _id: string;
  vehicleAlias: string;
  vehicle?: {
    _id: string;
    alias: string;
    marca: string;
    modelo: number;
  };
  categoria: string;
  monto: number;
  descripcion: string;
  proximoPago: string;
  frecuenciaRecurrencia: string;
  esRecurrente: boolean;
}

export interface EnhancedVehicleStats {
  counts: {
    totalRoutes: number;
    totalRefuels: number;
    totalMaintenance: number;
    totalExpenses: number;
  };
  costs: {
    fuelCost: number;
    maintenanceCost: number;
    otherExpenses: number;
    totalCost: number;
  };
  efficiency: {
    kmPerLiter: number;
    kmPerGallon: number;
    averageDistancePerRoute: number;
    costPerKm: number;
  };
  totalCostOfOwnership: number;
  totalDistance: number;
}

export interface FuelEfficiency {
  vehicle: {
    alias: string;
    marca: string;
    modelo: number;
  };
  efficiency: {
    kmPorLitro: number;
    kmPorGalon: number;
    costoPorKm: number;
    totalDistancia: number;
    totalGalones: number;
    totalGastoCombustible: number;
  };
  period: {
    startDate: string;
    endDate: string;
    totalRefuels: number;
    totalRoutes: number;
  };
}

export interface ExpenseFilters {
  vehicleAlias: string;
  categoria: string;
  startDate: string;
  endDate: string;
  esDeducibleImpuestos: string;
}