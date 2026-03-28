import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/expenses/upcoming - Get recurring expenses due in next 30 days
export async function GET(request) {
  try {
    // Get query params (optional filters)
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');
    const days = searchParams.get('days'); // optional: custom days ahead

    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (days) params.append('days', days);

    const path = `/api/expenses/upcoming${params.toString() ? '?' + params.toString() : ''}`;

    const response = await bffFetch(path);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al obtener gastos próximos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET upcoming expenses:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
