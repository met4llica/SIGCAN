import { NextRequest, NextResponse } from 'next/server';
import { Operativo, Zona, Turno, Veterinario, Voluntario } from '@/lib/db';
import { ESTADOS_TURNO_ACTIVOS } from '@/models/turno';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const operativos = await Operativo.findAll({
    include: [
      { model: Zona, as: 'zona' },
      { model: Veterinario, as: 'veterinarios' },
      { model: Voluntario, as: 'voluntarios' },
    ],
    order: [['fecha', 'DESC']],
  });

  // Cupo disponible calculado
  const conCupo = await Promise.all(
    operativos.map(async (op) => {
      const ocupados = await Turno.count({ where: { operativoId: op.id, estado: { [Op.in]: ESTADOS_TURNO_ACTIVOS.concat('completado') } } });
      return { ...op.toJSON(), cupoOcupado: ocupados, cupoDisponible: op.cupoMaximo - ocupados };
    })
  );

  return NextResponse.json(conCupo);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { fecha, lugar, zonaId, cupoMaximo, veterinarioIds, voluntarioIds } = await req.json();

    if (!fecha) return NextResponse.json({ error: 'La fecha es obligatoria' }, { status: 400 });
    if (!lugar || !lugar.trim()) return NextResponse.json({ error: 'El lugar es obligatorio' }, { status: 400 });
    if (!zonaId) return NextResponse.json({ error: 'La zona es obligatoria' }, { status: 400 });
    if (!cupoMaximo || Number(cupoMaximo) < 1) return NextResponse.json({ error: 'El cupo máximo debe ser mayor a 0' }, { status: 400 });

    const operativo = await Operativo.create({ fecha: new Date(fecha), lugar, zonaId, cupoMaximo: Number(cupoMaximo) });

    if (Array.isArray(veterinarioIds) && veterinarioIds.length) {
      await operativo.setVeterinarios(veterinarioIds);
    }
    if (Array.isArray(voluntarioIds) && voluntarioIds.length) {
      const { OperativoVoluntario } = await import('@/lib/db');
      await Promise.all(voluntarioIds.map((vId: number) => OperativoVoluntario.create({ operativoId: operativo.id, voluntarioId: vId })));
    }

    return NextResponse.json(operativo, { status: 201 });
  } catch (err) {
    console.error('[OPERATIVO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
