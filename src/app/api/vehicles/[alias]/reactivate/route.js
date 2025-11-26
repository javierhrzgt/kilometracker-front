import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// PATCH /api/vehicles/:alias/reactivate - Reactivate vehicle
export async function PATCH(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { alias } = await params;

    console.log('Reactivando vehículo:', alias);

    const response = await fetch(`${process.env.API_BASE_URL}/api/vehicles/${alias}/reactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || 'Error al reactivar el vehículo' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Vehículo reactivado exitosamente');
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PATCH reactivate vehicle:', error);
    return NextResponse.json(
      { error: 'Error al reactivar el vehículo: ' + error.message },
      { status: 500 }
    );
  }
}
