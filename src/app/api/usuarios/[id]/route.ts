import { NextRequest, NextResponse } from 'next/server';
import { Usuario } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const numericId = parseInt(id);
  const { nombre, apellido, email, rol, activo } = await req.json();

  const usuario = await Usuario.findByPk(numericId);
  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  if (!['admin', 'operador', 'veterinario'].includes(rol)) return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });

  try {
    usuario.nombre = nombre;
    usuario.apellido = apellido;
    usuario.email = email;
    usuario.rol = rol;
    usuario.activo = activo !== undefined ? activo : usuario.activo;
    await usuario.save();
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ message: 'Usuario actualizado' });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const numericId = parseInt(id);
  const usuario = await Usuario.findByPk(numericId);
  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  await usuario.destroy();
  return NextResponse.json({ message: 'Usuario eliminado' });
}
