import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/maintenance/:id - Get maintenance by ID
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

    console.log('Obteniendo mantenimiento:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/maintenance/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.error || 'Error al obtener mantenimiento' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET maintenance:', error);
    return NextResponse.json(
      { error: 'Error al obtener mantenimiento: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/maintenance/:id - Update maintenance record
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

    console.log('Actualizando mantenimiento:', id, body);

    const response = await fetch(`${process.env.API_BASE_URL}/api/maintenance/${id}`, {
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
        { error: data.error || 'Error al actualizar mantenimiento' },
        { status: response.status }
      );
    }

    console.log('Mantenimiento actualizado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT maintenance:', error);
    return NextResponse.json(
      { error: 'Error al actualizar mantenimiento: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance/:id - Delete maintenance (PERMANENT DELETE - cannot be undone)
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

    console.log('Eliminando mantenimiento:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/maintenance/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Error al eliminar mantenimiento' },
        { status: response.status }
      );
    }

    console.log('Mantenimiento eliminado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE maintenance:', error);
    return NextResponse.json(
      { error: 'Error al eliminar mantenimiento: ' + error.message },
      { status: 500 }
    );
  }
}
