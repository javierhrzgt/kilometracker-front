import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/auth/users/:id - Get user by ID (admin only)
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

    console.log('Obteniendo usuario:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Error al obtener usuario' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET user:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/users/:id - Deactivate user (admin only)
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

    console.log('Desactivando usuario:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Error al desactivar usuario' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Usuario desactivado exitosamente');
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE user:', error);
    return NextResponse.json(
      { error: 'Error al desactivar usuario: ' + error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/users/:id/reactivate - Reactivate user (admin only)
export async function PATCH(request, { params }) {
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

    console.log('Reactivando usuario:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/users/${id}/reactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Error al reactivar usuario' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Usuario reactivado exitosamente');
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PATCH reactivate user:', error);
    return NextResponse.json(
      { error: 'Error al reactivar usuario: ' + error.message },
      { status: 500 }
    );
  }
}
