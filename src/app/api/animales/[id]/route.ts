import { NextRequest, NextResponse } from 'next/server';
import { Animal, Vecino, Turno, Procedimiento } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const animal = await Animal.findByPk(id, { include: [{ model: Vecino, as: 'vecino' }] });
  if (!animal) return NextResponse.json({ error: 'Animal no encontrado' }, { status: 404 });
  return NextResponse.json(animal);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { nombre, especie, raza, sexo, edadEstimada, condicion, vecinoId } = await req.json();
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  if (!['macho', 'hembra'].includes(sexo)) return NextResponse.json({ error: 'Sexo inválido' }, { status: 400 });
  if (!['con_tutor', 'callejero'].includes(condicion)) return NextResponse.json({ error: 'Condición inválida' }, { status: 400 });
  if (condicion === 'con_tutor' && !vecinoId) {
    return NextResponse.json({ error: 'Un animal con tutor debe tener un vecino asociado' }, { status: 400 });
  }

  const animal = await Animal.findByPk(id);
  if (!animal) return NextResponse.json({ error: 'Animal no encontrado' }, { status: 404 });

  animal.nombre = nombre;
  animal.especie = especie || 'canino';
  animal.raza = raza || null;
  animal.sexo = sexo;
  animal.edadEstimada = edadEstimada || null;
  animal.condicion = condicion;
  animal.vecinoId = condicion === 'con_tutor' ? vecinoId : null;
  await animal.save();

  return NextResponse.json(animal);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const animal = await Animal.findByPk(id);
  if (!animal) return NextResponse.json({ error: 'Animal no encontrado' }, { status: 404 });

  const [turnos, procedimientos] = await Promise.all([
    Turno.count({ where: { animalId: id } }),
    Procedimiento.count({ include: [{ model: Turno, as: 'turno', where: { animalId: id } }] }),
  ]);
  if (turnos > 0 || procedimientos > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un animal con turnos o procedimientos registrados' }, { status: 400 });
  }

  await animal.destroy();
  return NextResponse.json({ message: 'Animal eliminado' });
}
