import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/maintenance - List all maintenance records (no soft delete, all records are active)
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

    const { searchParams } = new URL(request.url);

    // Remove isActive filter as maintenance uses permanent delete
    searchParams.delete('isActive');

    const queryString = searchParams.toString();

    console.log('Obteniendo mantenimientos con filtros:', queryString);

    const response = await fetch(
      `${process.env.API_BASE_URL}/api/maintenance${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener mantenimientos');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET maintenance:', error);
    return NextResponse.json(
      { error: 'Error al obtener mantenimientos: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Create new maintenance record
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    console.log('Creando mantenimiento:', body);

    const response = await fetch(`${process.env.API_BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Error al crear el mantenimiento' },
        { status: response.status }
      );
    }

    console.log('Mantenimiento creado exitosamente');

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error en POST maintenance:', error);
    return NextResponse.json(
      { error: 'Error al crear el mantenimiento: ' + error.message },
      { status: 500 }
    );
  }
}
