import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/vehicles/:alias - Obtener vehículo específico
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

    const { alias } = await params;

    const response = await fetch(`${process.env.API_BASE_URL}/api/vehicles/${alias}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener el vehículo');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET vehicle by alias:', error);
    return NextResponse.json(
      { error: 'Error al obtener el vehículo: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/:alias - Actualizar vehículo
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

    const { alias } = await params;
    const body = await request.json();

    console.log('Actualizando vehículo:', alias, body);

    const response = await fetch(`${process.env.API_BASE_URL}/api/vehicles/${alias}`, {
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
        { error: data.message || 'Error al actualizar el vehículo' },
        { status: response.status }
      );
    }

    console.log('Vehículo actualizado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PUT vehicle:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el vehículo: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/:alias - Eliminar vehículo
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

    const { alias } = await params;

    console.log('Eliminando vehículo:', alias);

    const response = await fetch(`${process.env.API_BASE_URL}/api/vehicles/${alias}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al eliminar el vehículo' },
        { status: response.status }
      );
    }

    console.log('Vehículo eliminado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE vehicle:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el vehículo: ' + error.message },
      { status: 500 }
    );
  }
}