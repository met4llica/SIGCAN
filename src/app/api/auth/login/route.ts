import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { Usuario } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y password son obligatorios' }, { status: 400 });
    }

    const usuario = await Usuario.findOne({ where: { email, activo: true } });
    if (!usuario) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

    const valid = await bcryptjs.compare(password, usuario.password);
    if (!valid) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

    const token = await generateToken(usuario);

    const response = NextResponse.json({
      message: 'Login exitoso',
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol },
    });

    response.cookies.set('sigcan_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[AUTH] Error en login:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
