import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/refuels/vehicle/:alias/analysis - Análisis de consumo
export async function GET(request, { params }) {
  try {
    const { alias } = await params;

    const response = await bffFetch(`/api/refuels/vehicle/${alias}/analysis`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener análisis de consumo' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET refuel analysis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
