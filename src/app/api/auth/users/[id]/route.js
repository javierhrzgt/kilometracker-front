import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/auth/users/:id - Get user by ID (admin only)
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/auth/users/${id}`);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
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
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/users/:id - Deactivate user (admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al desactivar usuario' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/users/:id/reactivate - Reactivate user (admin only)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/auth/users/${id}/reactivate`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al reactivar usuario' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PATCH reactivate user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
