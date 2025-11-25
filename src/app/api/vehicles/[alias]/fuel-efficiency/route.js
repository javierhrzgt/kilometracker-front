import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/vehicles/:alias/fuel-efficiency - Get fuel efficiency metrics
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { alias } = await params;

    // Get query params for date range filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const url = `${process.env.API_BASE_URL}/api/vehicles/${alias}/fuel-efficiency${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    console.log('Obteniendo eficiencia de combustible:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Error al obtener eficiencia de combustible' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET fuel efficiency:', error);
    return NextResponse.json(
      { error: 'Error al obtener eficiencia de combustible: ' + error.message },
      { status: 500 }
    );
  }
}
