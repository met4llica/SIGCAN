import { NextRequest, NextResponse } from 'next/server';
import { Usuario } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const usuarios = await Usuario.findAll({ attributes: { exclude: ['password'] } });
  return NextResponse.json(usuarios);
}

// POST — solo el administrador puede crear otros usuarios
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { nombre, apellido, email, password, rol } = await req.json();
    if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ error: 'Mínimo 6 caracteres' }, { status: 400 });
    if (!['admin', 'operador', 'veterinario'].includes(rol || 'operador')) return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });

    const bcryptjs = require('bcryptjs');
    const hash = await bcryptjs.hash(password, 10);

    const nuevo = await Usuario.create({ nombre, apellido, email, password: hash, rol: rol || 'operador', activo: true });
    return NextResponse.json({ message: 'Usuario creado', id: nuevo.id }, { status: 201 });
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }
    console.error('[USUARIO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
