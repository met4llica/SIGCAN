import { NextRequest, NextResponse } from 'next/server';
import { Animal, Vecino } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const where: any = {};
  if (q) where.nombre = { [Op.iLike]: `%${q}%` };

  const animales = await Animal.findAll({ where, include: [{ model: Vecino, as: 'vecino' }], order: [['nombre', 'ASC']] });
  return NextResponse.json(animales);
}

export async function POST(req: NextRequest) {
  try {
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

    const animal = await Animal.create({
      nombre,
      especie: especie || 'canino',
      raza: raza || null,
      sexo,
      edadEstimada: edadEstimada || null,
      condicion,
      vecinoId: condicion === 'con_tutor' ? vecinoId : null,
    });
    return NextResponse.json(animal, { status: 201 });
  } catch (err) {
    console.error('[ANIMAL] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
