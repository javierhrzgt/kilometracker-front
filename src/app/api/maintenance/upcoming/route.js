import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/maintenance/upcoming - Get upcoming maintenance
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

    console.log('Obteniendo mantenimientos próximos');

    const response = await fetch(`${process.env.API_BASE_URL}/api/maintenance/upcoming`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener mantenimientos próximos');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET upcoming maintenance:', error);
    return NextResponse.json(
      { error: 'Error al obtener mantenimientos próximos: ' + error.message },
      { status: 500 }
    );
  }
}
