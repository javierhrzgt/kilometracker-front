import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/vehicles/:alias - Obtener vehículo específico
export async function GET(request, { params }) {
  try {
    const { alias } = await params;

    const response = await bffFetch(`/api/vehicles/${alias}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener el vehículo' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET vehicle by alias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/:alias - Actualizar vehículo
export async function PUT(request, { params }) {
  try {
    const { alias } = await params;
    const body = await request.json();

    const response = await bffFetch(`/api/vehicles/${alias}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al actualizar el vehículo' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT vehicle:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/:alias - Eliminar vehículo
export async function DELETE(request, { params }) {
  try {
    const { alias } = await params;

    const response = await bffFetch(`/api/vehicles/${alias}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al eliminar el vehículo' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE vehicle:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
