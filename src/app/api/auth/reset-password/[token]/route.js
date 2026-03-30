import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { token } = await params;
    const body = await request.json();

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/resetpassword/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Error al restablecer la contraseña' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
