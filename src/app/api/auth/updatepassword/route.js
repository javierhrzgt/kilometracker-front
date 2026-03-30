import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// PUT /api/auth/updatepassword - Change password
export async function PUT(request) {
  try {
    const body = await request.json();

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

    const response = await bffFetch('/api/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al cambiar contraseña' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en updatepassword:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
