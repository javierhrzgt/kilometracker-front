import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/expenses/:id - Get expense by ID
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

    const { id } = await params;

    console.log('Obteniendo gasto:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/expenses/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
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
      { error: 'Error al obtener gasto: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/:id - Update expense
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    console.log('Actualizando gasto:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al actualizar gasto' },
        { status: response.status }
      );
    }

    console.log('Gasto actualizado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT expense:', error);
    return NextResponse.json(
      { error: 'Error al actualizar gasto: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/:id - Delete expense
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    console.log('Eliminando gasto:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Error al eliminar gasto' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Gasto eliminado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE expense:', error);
    return NextResponse.json(
      { error: 'Error al eliminar gasto: ' + error.message },
      { status: 500 }
    );
  }
}
