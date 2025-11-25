import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/expenses/summary - Get aggregated spending by category
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get query params (optional filters)
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `${process.env.API_BASE_URL}/api/expenses/summary${params.toString() ? '?' + params.toString() : ''}`;

    console.log('Obteniendo resumen de gastos:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
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
      { error: 'Error al obtener resumen de gastos: ' + error.message },
      { status: 500 }
    );
  }
}
