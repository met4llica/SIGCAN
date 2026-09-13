import { NextRequest, NextResponse } from 'next/server';
import { Veterinario } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const veterinarios = await Veterinario.findAll({ order: [['apellido', 'ASC']] });
  return NextResponse.json(veterinarios);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { nombre, apellido, matricula, especialidad } = await req.json();
    if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
    if (!matricula || !matricula.trim()) return NextResponse.json({ error: 'La matrícula es obligatoria' }, { status: 400 });

    try {
      const vet = await Veterinario.create({ nombre, apellido, matricula, especialidad: especialidad || null });
      return NextResponse.json(vet, { status: 201 });
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return NextResponse.json({ error: 'La matrícula ya está registrada' }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    console.error('[VETERINARIO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
