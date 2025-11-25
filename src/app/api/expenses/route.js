import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/expenses - List all expenses with filters
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');
    const categoria = searchParams.get('categoria');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const esDeducibleImpuestos = searchParams.get('esDeducibleImpuestos');
    const isActive = searchParams.get('isActive');

    // Build URL with params
    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (categoria) params.append('categoria', categoria);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (esDeducibleImpuestos !== null) params.append('esDeducibleImpuestos', esDeducibleImpuestos);
    if (isActive !== null) params.append('isActive', isActive);

    const url = `${process.env.API_BASE_URL}/api/expenses${params.toString() ? '?' + params.toString() : ''}`;

    console.log('Obteniendo gastos:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Error al obtener gastos' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en GET expenses:', error);
    return NextResponse.json(
      { error: 'Error al obtener gastos: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create new expense
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

    console.log('Creando gasto:', body);

    // Validation
    if (!body.vehicleAlias || !body.categoria || !body.monto || !body.descripcion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.API_BASE_URL}/api/expenses`, {
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
        { error: data.message || 'Error al crear gasto' },
        { status: response.status }
      );
    }

    console.log('Gasto creado exitosamente');

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en POST expense:', error);
    return NextResponse.json(
      { error: 'Error al crear gasto: ' + error.message },
      { status: 500 }
    );
  }
}
