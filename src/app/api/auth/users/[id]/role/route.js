import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    
    console.log('Cambiando rol de usuario:', id);

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/users/${id}/role`, {
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
        { error: data.message || 'Error al cambiar rol' },
        { status: response.status }
      );
    }

    console.log('Rol actualizado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en change role:', error);
    return NextResponse.json(
      { error: 'Error al cambiar rol: ' + error.message },
      { status: 500 }
    );
  }
}