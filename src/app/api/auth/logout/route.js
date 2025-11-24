import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Eliminar la cookie
  response.cookies.delete('token');
  
  return response;
}