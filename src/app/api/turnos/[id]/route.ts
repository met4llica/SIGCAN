import { NextRequest, NextResponse } from 'next/server';
import { Turno, Animal, Operativo, Notificacion } from '@/lib/db';
import { ESTADOS_TURNO_ACTIVOS } from '@/models/turno';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

type Params = { params: Promise<{ id: string }> };

const MENSAJES: Record<string, string> = {
  confirmado: 'Tu turno fue confirmado.',
  cancelado: 'Tu turno fue cancelado.',
  reprogramado: 'Tu turno fue reprogramado.',
};

// PATCH /api/turnos/[id] — confirmar, reprogramar (nueva fecha/operativo) o cancelar
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { estado, operativoId, fecha } = await req.json();
  const turno = await Turno.findByPk(id);
  if (!turno) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
  if (turno.estado === 'completado') {
    return NextResponse.json({ error: 'No se puede modificar un turno ya completado' }, { status: 400 });
  }

  if (!['confirmado', 'cancelado', 'reprogramado'].includes(estado)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  if (estado === 'reprogramado') {
    if (!operativoId && !fecha) {
      return NextResponse.json({ error: 'Reprogramar requiere un nuevo operativo o fecha' }, { status: 400 });
    }
    if (operativoId) {
      const nuevoOperativo = await Operativo.findByPk(operativoId);
      if (!nuevoOperativo) return NextResponse.json({ error: 'Operativo no encontrado' }, { status: 400 });
      const ocupados = await Turno.count({
        where: { operativoId, id: { [Op.ne]: turno.id }, estado: { [Op.in]: ESTADOS_TURNO_ACTIVOS.concat('completado') } },
      });
      if (ocupados >= nuevoOperativo.cupoMaximo) {
        return NextResponse.json({ error: 'El operativo destino no tiene cupos disponibles' }, { status: 400 });
      }
      turno.operativoId = operativoId;
      turno.fecha = nuevoOperativo.fecha;
    } else {
      turno.fecha = new Date(fecha);
    }
  }

  turno.estado = estado;
  await turno.save();

  await Notificacion.create({
    turnoId: turno.id,
    tipo: estado === 'confirmado' ? 'confirmacion' : estado === 'cancelado' ? 'cancelacion' : 'reprogramacion',
    mensaje: MENSAJES[estado] || 'El estado de tu turno cambió.',
  });

  return NextResponse.json(turno);
}
