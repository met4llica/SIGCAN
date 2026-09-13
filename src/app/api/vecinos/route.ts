import { NextRequest, NextResponse } from 'next/server';
import { Vecino, Zona } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const vecinos = await Vecino.findAll({ include: [{ model: Zona, as: 'zona' }], order: [['apellido', 'ASC']] });
  return NextResponse.json(vecinos);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { nombre, apellido, dni, telefono, email, direccion, zonaId } = await req.json();

    if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
    if (!dni || !dni.trim()) return NextResponse.json({ error: 'El DNI es obligatorio' }, { status: 400 });

    try {
      const vecino = await Vecino.create({
        nombre,
        apellido,
        dni,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        zonaId: zonaId || null,
      });
      return NextResponse.json(vecino, { status: 201 });
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return NextResponse.json({ error: 'El DNI ya está registrado' }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    console.error('[VECINO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
