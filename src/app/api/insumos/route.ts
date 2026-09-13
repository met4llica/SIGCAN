import { NextRequest, NextResponse } from 'next/server';
import { Insumo } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const insumos = await Insumo.findAll({ order: [['nombre', 'ASC']] });
  return NextResponse.json(insumos);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { nombre, unidad, stock } = await req.json();
    if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    if (stock !== undefined && Number(stock) < 0) return NextResponse.json({ error: 'El stock no puede ser negativo' }, { status: 400 });

    try {
      const insumo = await Insumo.create({ nombre, unidad: unidad || 'unidad', stock: Number(stock) || 0 });
      return NextResponse.json(insumo, { status: 201 });
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return NextResponse.json({ error: 'El insumo ya existe' }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    console.error('[INSUMO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
