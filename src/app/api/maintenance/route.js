import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/maintenance - List all maintenance records (no soft delete, all records are active)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Remove isActive filter as maintenance uses permanent delete
    searchParams.delete('isActive');

    const queryString = searchParams.toString();

    const response = await bffFetch(
      `/api/maintenance${queryString ? `?${queryString}` : ''}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener mantenimientos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET maintenance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Create new maintenance record
export async function POST(request) {
  try {
    const body = await request.json();

    const response = await bffFetch('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Error al crear el mantenimiento' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error en POST maintenance:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
