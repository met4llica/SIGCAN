import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sigcan-dev-secret-change-in-prod');
const JWT_EXPIRES_IN = '8h';

export interface JwtPayload {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'operador' | 'veterinario';
}

// Generar token JWT
export async function generateToken(usuario: {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}): Promise<string> {
  return new SignJWT({
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

// Verificar token JWT
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// Verificar que el usuario tenga un rol permitido
export function requireRole(...roles: string[]) {
  return (req: Request, user: JwtPayload): boolean => {
    return roles.includes(user.rol);
  };
}
