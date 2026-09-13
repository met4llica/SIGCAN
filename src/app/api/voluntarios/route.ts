import { NextRequest, NextResponse } from 'next/server';
import { Voluntario } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const voluntarios = await Voluntario.findAll({ order: [['apellido', 'ASC']] });
  return NextResponse.json(voluntarios);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { nombre, apellido, telefono, disponibilidad } = await req.json();
    if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });

    const voluntario = await Voluntario.create({
      nombre,
      apellido,
      telefono: telefono || null,
      disponibilidad: disponibilidad || null,
    });
    return NextResponse.json(voluntario, { status: 201 });
  } catch (err) {
    console.error('[VOLUNTARIO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
