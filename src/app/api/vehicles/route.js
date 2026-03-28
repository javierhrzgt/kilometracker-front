import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/vehicles - Listar vehículos
export async function GET(request) {
  try {
    // Obtener query params
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive');
    const isActive = searchParams.get('isActive');

    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', includeInactive);
    if (isActive !== null) params.append('isActive', isActive);

    const path = `/api/vehicles${params.toString() ? '?' + params.toString() : ''}`;

    const response = await bffFetch(path);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener vehículos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET vehicles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Crear vehículo
export async function POST(request) {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.alias || !body.marca || !body.modelo || !body.plates) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await bffFetch('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Error al crear el vehículo' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en POST vehicles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
