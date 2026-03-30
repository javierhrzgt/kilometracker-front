import { cookies } from 'next/headers';

/**
 * Helper para BFF routes: adjunta automáticamente el token JWT de la cookie
 * como header Authorization. Úsalo en todos los server-side API route handlers.
 *
 * Si no hay token activo, devuelve una Response 401 directamente (no hace
 * fetch al backend), de modo que el caller puede tratarla como cualquier
 * otra respuesta fallida con !response.ok.
 *
 * @example
 * const response = await bffFetch('/api/vehicles');
 * if (!response.ok) {
 *   const err = await response.json().catch(() => ({}));
 *   return NextResponse.json({ error: err.error || 'Error' }, { status: response.status });
 * }
 * const data = await response.json();
 * return NextResponse.json(data);
 */
export async function bffFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return fetch(`${process.env.API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
}
