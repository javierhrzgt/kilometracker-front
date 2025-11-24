import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// PUT /api/auth/updatepassword - Change password
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    console.log('Cambiando contraseña');

    // Validation
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva son requeridas' },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/updatepassword`, {
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
        { error: data.message || 'Error al cambiar contraseña' },
        { status: response.status }
      );
    }

    console.log('Contraseña actualizada exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en updatepassword:', error);
    return NextResponse.json(
      { error: 'Error al cambiar contraseña: ' + error.message },
      { status: 500 }
    );
  }
}
