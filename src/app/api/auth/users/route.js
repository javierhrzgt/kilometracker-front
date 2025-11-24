import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/auth/users - List all users (admin only)
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    // Build URL with params
    const params = new URLSearchParams();
    if (isActive !== null) params.append('isActive', isActive);

    const url = `${process.env.API_BASE_URL}/api/auth/users${params.toString() ? '?' + params.toString() : ''}`;

    console.log('Obteniendo usuarios:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
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
      { error: 'Error al obtener usuarios: ' + error.message },
      { status: 500 }
    );
  }
}
