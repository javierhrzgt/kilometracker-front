import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/vehicles/:alias/stats - Obtener estadísticas del vehículo
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

    console.log('Obteniendo estadísticas de:', alias);

    const response = await fetch(`${process.env.API_BASE_URL}/api/vehicles/${alias}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET vehicle stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas: ' + error.message },
      { status: 500 }
    );
  }
}