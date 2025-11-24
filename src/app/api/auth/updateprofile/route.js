import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    
    console.log('Actualizando perfil');

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/updateprofile`, {
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
        { error: data.message || 'Error al actualizar perfil' },
        { status: response.status }
      );
    }

    console.log('Perfil actualizado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en updateprofile:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil: ' + error.message },
      { status: 500 }
    );
  }
}