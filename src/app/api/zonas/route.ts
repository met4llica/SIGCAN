import { NextRequest, NextResponse } from 'next/server';
import { Zona } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const zonas = await Zona.findAll({ order: [['nombre', 'ASC']] });
  return NextResponse.json(zonas);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { nombre } = await req.json();
    if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });

    try {
      const zona = await Zona.create({ nombre });
      return NextResponse.json(zona, { status: 201 });
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return NextResponse.json({ error: 'La zona ya existe' }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    console.error('[ZONA] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
