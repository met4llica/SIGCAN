import { NextRequest, NextResponse } from 'next/server';
import { Veterinario, Operativo } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { nombre, apellido, matricula, especialidad, activo } = await req.json();
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
  if (!matricula || !matricula.trim()) return NextResponse.json({ error: 'La matrícula es obligatoria' }, { status: 400 });

  const vet = await Veterinario.findByPk(id);
  if (!vet) return NextResponse.json({ error: 'Veterinario no encontrado' }, { status: 404 });

  try {
    vet.nombre = nombre;
    vet.apellido = apellido;
    vet.matricula = matricula;
    vet.especialidad = especialidad || null;
    if (activo !== undefined) vet.activo = activo;
    await vet.save();
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'La matrícula ya está registrada' }, { status: 409 });
    }
    throw err;
  }
  return NextResponse.json(vet);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const vet = await Veterinario.findByPk(id);
  if (!vet) return NextResponse.json({ error: 'Veterinario no encontrado' }, { status: 404 });

  // Regla: no eliminar si está asignado a un operativo futuro
  const operativosFuturos = await vet.getOperativos({ where: { fecha: { [Op.gte]: new Date() } } });
  if (operativosFuturos.length > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un veterinario asignado a un operativo futuro' }, { status: 400 });
  }

  await vet.destroy();
  return NextResponse.json({ message: 'Veterinario eliminado' });
}
