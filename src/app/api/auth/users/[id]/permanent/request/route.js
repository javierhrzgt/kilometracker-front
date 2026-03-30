import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// POST /api/auth/users/:id/permanent/request - Request permanent delete code (root only)
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    const response = await bffFetch(`/api/auth/users/${id}/permanent/request`, {
      method: 'POST',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al enviar código de verificación' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en POST permanent/request:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
