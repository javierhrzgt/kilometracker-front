import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// GET /api/expenses - List all expenses (no soft delete, all records are active)
export async function GET(request) {
  try {
    // Get query params
    const { searchParams } = new URL(request.url);
    const vehicleAlias = searchParams.get('vehicleAlias');
    const categoria = searchParams.get('categoria');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const esDeducibleImpuestos = searchParams.get('esDeducibleImpuestos');
    // Removed isActive - expenses now use permanent delete

    // Build URL with params
    const params = new URLSearchParams();
    if (vehicleAlias) params.append('vehicleAlias', vehicleAlias);
    if (categoria) params.append('categoria', categoria);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (esDeducibleImpuestos !== null) params.append('esDeducibleImpuestos', esDeducibleImpuestos);
    // isActive filter removed as expenses use permanent delete

    const path = `/api/expenses${params.toString() ? '?' + params.toString() : ''}`;

    const response = await bffFetch(path);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
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
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create new expense
export async function POST(request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.vehicleAlias || !body.categoria || !body.monto || !body.descripcion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const response = await bffFetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al crear gasto' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en POST expense:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
