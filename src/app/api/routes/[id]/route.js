import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/routes/:id - Obtener ruta específica
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

    const { id } = await params; // ← Agregar await aquí

    const response = await fetch(`${process.env.API_BASE_URL}/api/routes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener la ruta');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET route by id:', error);
    return NextResponse.json(
      { error: 'Error al obtener la ruta: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/routes/:id - Actualizar ruta
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

    const { id } = await params; // ← Agregar await aquí
    const body = await request.json();

    console.log('Actualizando ruta:', id, body);

    const response = await fetch(`${process.env.API_BASE_URL}/api/routes/${id}`, {
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
        { error: data.message || 'Error al actualizar la ruta' },
        { status: response.status }
      );
    }

    console.log('Ruta actualizada exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT route:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la ruta: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/:id - Eliminar ruta
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

    const { id } = await params; // ← Agregar await aquí

    console.log('Eliminando ruta:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/routes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al eliminar la ruta' },
        { status: response.status }
      );
    }

    console.log('Ruta eliminada exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE route:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la ruta: ' + error.message },
      { status: 500 }
    );
  }
}