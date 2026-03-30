import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// DELETE /api/auth/users/:id/permanent - Permanently delete user (root only)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await bffFetch(`/api/auth/users/${id}/permanent`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al eliminar usuario permanentemente' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en DELETE permanent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
