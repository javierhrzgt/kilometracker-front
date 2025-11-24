import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/refuels/vehicle/:alias/analysis - Análisis de consumo
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

    console.log('Obteniendo análisis de consumo de:', alias);

    const response = await fetch(`${process.env.API_BASE_URL}/api/refuels/vehicle/${alias}/analysis`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener análisis de consumo');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET refuel analysis:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis de consumo: ' + error.message },
      { status: 500 }
    );
  }
}