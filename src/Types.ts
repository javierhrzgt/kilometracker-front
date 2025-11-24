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
  totalRoutes: number;
  totalDistancia: number;
  promedioDistanciaPorRuta: number;
  totalRefuels: number;
  totalGastoCombustible: number;
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