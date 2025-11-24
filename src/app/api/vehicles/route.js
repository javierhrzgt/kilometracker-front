import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/vehicles - Listar vehículos
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
    const includeInactive = searchParams.get('includeInactive');
    const isActive = searchParams.get('isActive');

    // Construir URL con parámetros
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', includeInactive);
    if (isActive !== null) params.append('isActive', isActive);

    const url = `${process.env.API_BASE_URL}/api/vehicles${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log('Obteniendo vehículos:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener vehículos');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET vehicles:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículos: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Crear vehículo
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
    
    console.log('Creando vehículo:', body);

    // Validación básica
    if (!body.alias || !body.marca || !body.modelo || !body.plates) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.API_BASE_URL}/api/vehicles`, {
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
        { error: data.message || 'Error al crear el vehículo' },
        { status: response.status }
      );
    }

    console.log('Vehículo creado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en POST vehicles:', error);
    return NextResponse.json(
      { error: 'Error al crear el vehículo: ' + error.message },
      { status: 500 }
    );
  }
}