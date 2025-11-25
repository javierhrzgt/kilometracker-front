import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/expenses/upcoming - Get recurring expenses due in next 30 days
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
    const days = searchParams.get('days'); // optional: custom days ahead

    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (days) params.append('days', days);

    const url = `${process.env.API_BASE_URL}/api/expenses/upcoming${params.toString() ? '?' + params.toString() : ''}`;

    console.log('Obteniendo gastos próximos:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
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
      { error: 'Error al obtener gastos próximos: ' + error.message },
      { status: 500 }
    );
  }
}
