import { NextResponse } from 'next/server';
import { bffFetch } from '@/lib/backendFetch';

// PATCH /api/vehicles/:alias/reactivate - Reactivate vehicle
export async function PATCH(request, { params }) {
  try {
    const { alias } = await params;

    const response = await bffFetch(`/api/vehicles/${alias}/reactivate`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || 'Error al reactivar el vehículo' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en PATCH reactivate vehicle:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
