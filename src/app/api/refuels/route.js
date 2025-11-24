import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/refuels - Listar reabastecimientos
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

    // Obtener query params
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');

    // Construir URL con filtros
    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);

    const url = `${process.env.API_BASE_URL}/api/refuels${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Obteniendo reabastecimientos:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener reabastecimientos');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET refuels:', error);
    return NextResponse.json(
      { error: 'Error al obtener reabastecimientos: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/refuels - Crear reabastecimiento
export async function POST(request) {
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
    
    console.log('Creando reabastecimiento:', body);

    // Validación básica
    if (!body.vehicleAlias || !body.tipoCombustible || !body.cantidadGastada) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.API_BASE_URL}/api/refuels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al crear el reabastecimiento' },
        { status: response.status }
      );
    }

    console.log('Reabastecimiento creado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en POST refuels:', error);
    return NextResponse.json(
      { error: 'Error al crear el reabastecimiento: ' + error.message },
      { status: 500 }
    );
  }
}