import { NextRequest, NextResponse } from 'next/server';
import { sequelize, Turno, Procedimiento, ProcedimientoInsumo, Insumo, HistorialClinico, Animal, Veterinario } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const procedimientos = await Procedimiento.findAll({
    include: [
      { model: Turno, as: 'turno', include: [{ model: Animal, as: 'animal' }] },
      { model: Veterinario, as: 'veterinario' },
      { model: Insumo, as: 'insumos' },
    ],
    order: [['fecha', 'DESC']],
  });
  return NextResponse.json(procedimientos);
}

// POST /api/procedimientos — confirmar que se realizó un procedimiento sobre un turno.
// Cascada transaccional: turno -> completado, descuenta stock de insumos, alta en historial clínico.
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'veterinario'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { turnoId, veterinarioId, tipo, observaciones, insumos } = await req.json();

    if (!turnoId) return NextResponse.json({ error: 'El turno es obligatorio' }, { status: 400 });
    if (!veterinarioId) return NextResponse.json({ error: 'El veterinario es obligatorio' }, { status: 400 });
    if (!['castracion', 'chipeo', 'ambos'].includes(tipo)) return NextResponse.json({ error: 'Tipo de procedimiento inválido' }, { status: 400 });

    const turno = await Turno.findByPk(turnoId, { include: [{ model: Animal, as: 'animal' }] });
    if (!turno) return NextResponse.json({ error: 'Turno no encontrado' }, { status: 400 });
    if (turno.estado === 'completado') return NextResponse.json({ error: 'Este turno ya tiene un procedimiento registrado' }, { status: 400 });
    if (turno.estado === 'cancelado') return NextResponse.json({ error: 'No se puede registrar un procedimiento sobre un turno cancelado' }, { status: 400 });

    const veterinario = await Veterinario.findByPk(veterinarioId);
    if (!veterinario) return NextResponse.json({ error: 'Veterinario no encontrado' }, { status: 400 });

    const insumosUsados: { insumoId: number; cantidadUsada: number }[] = Array.isArray(insumos) ? insumos : [];

    const t = await sequelize.transaction();
    try {
      // Validar y descontar stock de insumos
      for (const item of insumosUsados) {
        const insumo = await Insumo.findByPk(item.insumoId, { transaction: t });
        if (!insumo) {
          await t.rollback();
          return NextResponse.json({ error: `Insumo ${item.insumoId} no encontrado` }, { status: 400 });
        }
        if (item.cantidadUsada > insumo.stock) {
          await t.rollback();
          return NextResponse.json({ error: `Stock insuficiente de ${insumo.nombre}` }, { status: 400 });
        }
      }

      const procedimiento = await Procedimiento.create(
        { turnoId, veterinarioId, tipo, observaciones: observaciones || null },
        { transaction: t }
      );

      for (const item of insumosUsados) {
        await ProcedimientoInsumo.create(
          { procedimientoId: procedimiento.id, insumoId: item.insumoId, cantidadUsada: item.cantidadUsada },
          { transaction: t }
        );
        const insumo = await Insumo.findByPk(item.insumoId, { transaction: t });
        if (insumo) {
          insumo.stock -= item.cantidadUsada;
          await insumo.save({ transaction: t });
        }
      }

      // Turno -> completado
      turno.estado = 'completado';
      await turno.save({ transaction: t });

      // Alta en historial clínico
      const tipoTexto = tipo === 'ambos' ? 'castración y chipeo' : tipo;
      await HistorialClinico.create(
        {
          animalId: turno.animalId,
          procedimientoId: procedimiento.id,
          descripcion: `Se realizó ${tipoTexto} el ${new Date().toLocaleDateString('es-AR')}. Veterinario: ${veterinario.nombre} ${veterinario.apellido}.${observaciones ? ' Obs: ' + observaciones : ''}`,
        },
        { transaction: t }
      );

      await t.commit();
      return NextResponse.json({ message: 'Procedimiento registrado', procedimientoId: procedimiento.id }, { status: 201 });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    console.error('[PROCEDIMIENTO] Error registrando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
