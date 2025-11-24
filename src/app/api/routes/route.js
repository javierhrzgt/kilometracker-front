import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    
    console.log('Creando ruta:', body);

    if (!body.vehicleAlias || !body.distanciaRecorrida || !body.fecha) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.API_BASE_URL}/api/routes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Status de crear ruta:', response.status);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al crear la ruta' },
        { status: response.status }
      );
    }

    console.log('Ruta creada exitosamente. Nuevo kilometraje:', data.vehicleKilometraje);

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en routes:', error);
    return NextResponse.json(
      { error: 'Error al crear la ruta: ' + error.message },
      { status: 500 }
    );
  }
}

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir URL con filtros
    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `${process.env.API_BASE_URL}/api/routes${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Obteniendo rutas:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener rutas');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET routes:', error);
    return NextResponse.json(
      { error: 'Error al obtener rutas: ' + error.message },
      { status: 500 }
    );
  }
}