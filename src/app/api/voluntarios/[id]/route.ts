import { NextRequest, NextResponse } from 'next/server';
import { Voluntario } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { nombre, apellido, telefono, disponibilidad } = await req.json();
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });

  const voluntario = await Voluntario.findByPk(id);
  if (!voluntario) return NextResponse.json({ error: 'Voluntario no encontrado' }, { status: 404 });

  voluntario.nombre = nombre;
  voluntario.apellido = apellido;
  voluntario.telefono = telefono || null;
  voluntario.disponibilidad = disponibilidad || null;
  await voluntario.save();

  return NextResponse.json(voluntario);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const voluntario = await Voluntario.findByPk(id);
  if (!voluntario) return NextResponse.json({ error: 'Voluntario no encontrado' }, { status: 404 });

  const operativosFuturos = await voluntario.getOperativos({ where: { fecha: { [Op.gte]: new Date() } } });
  if (operativosFuturos.length > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un voluntario asignado a un operativo futuro' }, { status: 400 });
  }

  await voluntario.destroy();
  return NextResponse.json({ message: 'Voluntario eliminado' });
}
