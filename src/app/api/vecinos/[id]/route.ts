import { NextRequest, NextResponse } from 'next/server';
import { Vecino, Zona, Animal, Turno } from '@/lib/db';
import { ESTADOS_TURNO_ACTIVOS } from '@/models/turno';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const vecino = await Vecino.findByPk(id, { include: [{ model: Zona, as: 'zona' }, { model: Animal, as: 'animales' }] });
  if (!vecino) return NextResponse.json({ error: 'Vecino no encontrado' }, { status: 404 });
  return NextResponse.json(vecino);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { nombre, apellido, dni, telefono, email, direccion, zonaId } = await req.json();
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  if (!apellido || !apellido.trim()) return NextResponse.json({ error: 'El apellido es obligatorio' }, { status: 400 });
  if (!dni || !dni.trim()) return NextResponse.json({ error: 'El DNI es obligatorio' }, { status: 400 });

  const vecino = await Vecino.findByPk(id);
  if (!vecino) return NextResponse.json({ error: 'Vecino no encontrado' }, { status: 404 });

  try {
    vecino.nombre = nombre;
    vecino.apellido = apellido;
    vecino.dni = dni;
    vecino.telefono = telefono || null;
    vecino.email = email || null;
    vecino.direccion = direccion || null;
    vecino.zonaId = zonaId || null;
    await vecino.save();
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'El DNI ya está registrado' }, { status: 409 });
    }
    throw err;
  }
  return NextResponse.json(vecino);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const vecino = await Vecino.findByPk(id);
  if (!vecino) return NextResponse.json({ error: 'Vecino no encontrado' }, { status: 404 });

  // Regla: no eliminar si tiene turnos pendientes asociados (a través de sus animales)
  const animales = await Animal.findAll({ where: { vecinoId: id }, attributes: ['id'] });
  const animalIds = animales.map((a) => a.id);
  const turnosActivos = animalIds.length
    ? await Turno.count({ where: { animalId: { [Op.in]: animalIds }, estado: { [Op.in]: ESTADOS_TURNO_ACTIVOS } } })
    : 0;
  if (turnosActivos > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un vecino con turnos pendientes asociados' }, { status: 400 });
  }

  await vecino.destroy();
  return NextResponse.json({ message: 'Vecino eliminado' });
}
