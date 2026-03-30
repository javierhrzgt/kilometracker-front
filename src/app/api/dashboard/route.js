import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/dashboard — Resumen global del usuario
export async function GET() {
  try {
    const response = await bffFetch('/api/dashboard');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener datos del dashboard' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET dashboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
