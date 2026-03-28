import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.vehicleAlias || !body.distanciaRecorrida || !body.fecha) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await bffFetch('/api/routes', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al crear la ruta' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en routes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Obtener query params
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir URL con filtros
    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const path = `/api/routes${params.toString() ? '?' + params.toString() : ''}`;

    const response = await bffFetch(path);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener rutas' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET routes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
