import { NextRequest, NextResponse } from 'next/server';
import { Turno, Animal, Operativo, Vecino, Notificacion } from '@/lib/db';
import { ESTADOS_TURNO_ACTIVOS } from '@/models/turno';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado');
  const where: any = {};
  if (estado) where.estado = estado;

  const turnos = await Turno.findAll({
    where,
    include: [
      { model: Animal, as: 'animal', include: [{ model: Vecino, as: 'vecino' }] },
      { model: Operativo, as: 'operativo' },
    ],
    order: [['fecha', 'DESC']],
  });
  return NextResponse.json(turnos);
}

// POST /api/turnos — solicitar turno
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { animalId, operativoId, fecha } = await req.json();
    if (!animalId) return NextResponse.json({ error: 'El animal es obligatorio' }, { status: 400 });
    if (!operativoId) return NextResponse.json({ error: 'El operativo es obligatorio' }, { status: 400 });

    const animal = await Animal.findByPk(animalId);
    if (!animal) return NextResponse.json({ error: 'Animal no encontrado' }, { status: 400 });

    const operativo = await Operativo.findByPk(operativoId);
    if (!operativo) return NextResponse.json({ error: 'Operativo no encontrado' }, { status: 400 });
    if (operativo.estado === 'cancelado') return NextResponse.json({ error: 'El operativo está cancelado' }, { status: 400 });

    // Regla: no asignar si el operativo no tiene cupos disponibles
    const ocupados = await Turno.count({
      where: { operativoId, estado: { [Op.in]: ESTADOS_TURNO_ACTIVOS.concat('completado') } },
    });
    if (ocupados >= operativo.cupoMaximo) {
      return NextResponse.json({ error: 'El operativo no tiene cupos disponibles' }, { status: 400 });
    }

    // Regla: un mismo animal no puede tener dos turnos activos simultáneos
    const turnoActivoExistente = await Turno.count({
      where: { animalId, estado: { [Op.in]: ESTADOS_TURNO_ACTIVOS } },
    });
    if (turnoActivoExistente > 0) {
      return NextResponse.json({ error: 'El animal ya tiene un turno activo' }, { status: 400 });
    }

    const turno = await Turno.create({
      animalId,
      operativoId,
      fecha: fecha ? new Date(fecha) : operativo.fecha,
    });

    await Notificacion.create({
      turnoId: turno.id,
      tipo: 'confirmacion',
      mensaje: `Turno asignado para ${animal.nombre} el ${new Date(turno.fecha).toLocaleDateString('es-AR')} en ${operativo.lugar}.`,
    });

    return NextResponse.json(turno, { status: 201 });
  } catch (err) {
    console.error('[TURNO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
