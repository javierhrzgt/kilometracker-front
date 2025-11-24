import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Obtener datos del body
    const { email, password } = await request.json();

    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    console.log('Intentando login con:', email);
    console.log('URL de API:', `${process.env.API_BASE_URL}/api/auth/login`);

    // Llamar a tu API externa
    const response = await fetch(`${process.env.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Status de respuesta:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Respuesta no JSON recibida:', textResponse.substring(0, 200));
      return NextResponse.json(
        { error: 'La API no respondió correctamente. Verifica la URL del endpoint.' },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Si la API externa devuelve error
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error de autenticación' },
        { status: response.status }
      );
    }

    // Extraer el token (puede estar en data.token o data.data.token)
    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;

    // Verificar que el token existe en la respuesta
    if (!token) {
      console.error('Respuesta de API sin token:', data);
      return NextResponse.json(
        { error: 'La API no devolvió un token válido' },
        { status: 502 }
      );
    }

    console.log('Login exitoso para:', user?.email);

    // Crear respuesta con cookie HttpOnly
    const cookieResponse = NextResponse.json(
      { 
        success: true,
        user: user
      },
      { status: 200 }
    );

    // Configurar cookie segura con el JWT
    cookieResponse.cookies.set('token', token, {
      httpOnly: true,      // No accesible desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',  // Protección CSRF
      maxAge: 86400,       // 24 horas
      path: '/',
    });

    return cookieResponse;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}