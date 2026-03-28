import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/expenses/:id - Get expense by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/expenses/${id}`);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al obtener gasto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET expense:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/:id - Update expense
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await bffFetch(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al actualizar gasto' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT expense:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/:id - Delete expense (PERMANENT DELETE - cannot be undone)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al eliminar gasto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE expense:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
