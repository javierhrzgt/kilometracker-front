import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Registrando usuario:', body.email);

    // Validación básica
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al registrar usuario' },
        { status: response.status }
      );
    }

    console.log('Usuario registrado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en register:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario: ' + error.message },
      { status: 500 }
    );
  }
}