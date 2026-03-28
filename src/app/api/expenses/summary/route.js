import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/expenses/summary - Get aggregated spending by category
export async function GET(request) {
  try {
    // Get query params (optional filters)
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const path = `/api/expenses/summary${params.toString() ? '?' + params.toString() : ''}`;

    const response = await bffFetch(path);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al obtener resumen de gastos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET expenses summary:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
