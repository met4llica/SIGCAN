import { NextRequest, NextResponse } from 'next/server';
import { Operativo, Zona, Veterinario, Voluntario, Turno, Notificacion } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const operativo = await Operativo.findByPk(id, {
    include: [
      { model: Zona, as: 'zona' },
      { model: Veterinario, as: 'veterinarios' },
      { model: Voluntario, as: 'voluntarios' },
      { model: Turno, as: 'turnos' },
    ],
  });
  if (!operativo) return NextResponse.json({ error: 'Operativo no encontrado' }, { status: 404 });
  return NextResponse.json(operativo);
}

// PATCH — editar datos, o cancelar (body: { estado: 'cancelado' }) con cascada sobre turnos
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const operativo = await Operativo.findByPk(id);
  if (!operativo) return NextResponse.json({ error: 'Operativo no encontrado' }, { status: 404 });

  if (body.estado === 'cancelado') {
    const { sequelize } = await import('@/lib/db');
    const t = await sequelize.transaction();
    try {
      operativo.estado = 'cancelado';
      await operativo.save({ transaction: t });

      const turnos = await Turno.findAll({ where: { operativoId: id }, transaction: t });
      for (const turno of turnos) {
        if (turno.estado !== 'completado') {
          turno.estado = 'cancelado';
          await turno.save({ transaction: t });
          await Notificacion.create(
            { turnoId: turno.id, tipo: 'cancelacion', mensaje: `Se canceló el operativo del ${operativo.lugar}; tu turno fue cancelado.` },
            { transaction: t }
          );
        }
      }
      await t.commit();
      return NextResponse.json({ message: 'Operativo cancelado, turnos asociados cancelados en cascada' });
    } catch (err) {
      await t.rollback();
      console.error('[OPERATIVO] Error cancelando:', err);
      return NextResponse.json({ error: 'Error al cancelar' }, { status: 500 });
    }
  }

  const { fecha, lugar, zonaId, cupoMaximo, veterinarioIds, estado } = body;
  if (fecha) operativo.fecha = new Date(fecha);
  if (lugar) operativo.lugar = lugar;
  if (zonaId) operativo.zonaId = zonaId;
  if (cupoMaximo) operativo.cupoMaximo = Number(cupoMaximo);
  if (estado) operativo.estado = estado;
  await operativo.save();

  if (Array.isArray(veterinarioIds)) {
    await operativo.setVeterinarios(veterinarioIds);
  }

  return NextResponse.json(operativo);
}
