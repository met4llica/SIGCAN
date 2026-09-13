import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from './auth';

const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/register'];

// Middleware: proteger rutas, validar token JWT desde cookie
export async function authMiddleware(req: NextRequest) {
  const token = req.cookies.get('sigcan_token')?.value;

  if (!token) {
    // Si es una ruta pública, dejar pasar
    if (PUBLIC_ROUTES.some((r) => req.nextUrl.pathname.startsWith(r))) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Ruta protegida — dejar pasar con usuario en headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', String(payload.id));
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-rol', payload.rol);
  return response;
}

// Helper: extraer usuario autenticado desde Request (en route handlers)
export async function getAuthenticatedUser(req: Request): Promise<JwtPayload | null> {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  // Parse cookies from header
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((c) => {
    const [k, v] = c.trim().split('=');
    if (k) cookies[k] = v;
  });

  const token = cookies.sigcan_token;
  if (!token) return null;
  return verifyToken(token);
}

// Helper: extraer usuario y validar rol (lanza si no tiene permiso)
export async function getUserOrForbidden(req: Request): Promise<JwtPayload> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    throw new Error('No autorizado');
  }
  return user;
}

// Helper: validar rol del usuario
export function checkRole(user: JwtPayload, roles: string[]): boolean {
  return roles.includes(user.rol);
}
