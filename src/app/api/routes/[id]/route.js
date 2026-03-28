import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/routes/:id - Obtener ruta específica
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/routes/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Error al obtener la ruta' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET route by id:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/routes/:id - Actualizar ruta
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await bffFetch(`/api/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al actualizar la ruta' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/:id - Eliminar ruta
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/routes/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al eliminar la ruta' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
