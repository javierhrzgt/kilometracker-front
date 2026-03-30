import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/refuels/:id - Obtener reabastecimiento específico
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/refuels/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener el reabastecimiento' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET refuel by id:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/refuels/:id - Actualizar reabastecimiento
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await bffFetch(`/api/refuels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al actualizar el reabastecimiento' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT refuel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/refuels/:id - Eliminar reabastecimiento
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/refuels/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al eliminar el reabastecimiento' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE refuel:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
