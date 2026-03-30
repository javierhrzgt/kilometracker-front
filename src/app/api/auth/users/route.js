import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/auth/users - List all users (admin only)
export async function GET(request) {
  try {
    // Get query params
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    // Build URL with params
    const params = new URLSearchParams();
    if (isActive !== null) params.append('isActive', isActive);

    const path = `/api/auth/users${params.toString() ? '?' + params.toString() : ''}`;

    const response = await bffFetch(path);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al obtener usuarios' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
