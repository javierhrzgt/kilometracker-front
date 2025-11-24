import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/refuels/:id - Obtener reabastecimiento específico
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

    const response = await fetch(`${process.env.API_BASE_URL}/api/refuels/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el reabastecimiento');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET refuel by id:', error);
    return NextResponse.json(
      { error: 'Error al obtener el reabastecimiento: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/refuels/:id - Actualizar reabastecimiento
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

    console.log('Actualizando reabastecimiento:', id, body);

    const response = await fetch(`${process.env.API_BASE_URL}/api/refuels/${id}`, {
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
        { error: data.message || 'Error al actualizar el reabastecimiento' },
        { status: response.status }
      );
    }

    console.log('Reabastecimiento actualizado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT refuel:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el reabastecimiento: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/refuels/:id - Eliminar reabastecimiento
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

    console.log('Eliminando reabastecimiento:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/refuels/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al eliminar el reabastecimiento' },
        { status: response.status }
      );
    }

    console.log('Reabastecimiento eliminado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE refuel:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el reabastecimiento: ' + error.message },
      { status: 500 }
    );
  }
}