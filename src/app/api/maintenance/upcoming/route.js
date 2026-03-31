import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/maintenance/upcoming - Get upcoming maintenance
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');

    const backendParams = new URLSearchParams();
    if (vehicleAlias) backendParams.append('vehicleAlias', vehicleAlias);

    const query = backendParams.toString();
    const response = await bffFetch(`/api/maintenance/upcoming${query ? `?${query}` : ''}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener mantenimientos próximos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET upcoming maintenance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
