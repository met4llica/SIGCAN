import { NextRequest, NextResponse } from 'next/server';
import { Procedimiento, Turno, Operativo, Zona, ReporteAvistamiento, Animal } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    const whereFecha: any = {};
    if (desde && hasta) whereFecha.fecha = { [Op.between]: [desde, hasta] };

    // Castraciones/chipeos por zona y período
    const procedimientos = await Procedimiento.findAll({
      where: whereFecha,
      include: [{ model: Turno, as: 'turno', include: [{ model: Operativo, as: 'operativo', include: [{ model: Zona, as: 'zona' }] }] }],
    });

    const porZona: Record<string, { zona: string; castraciones: number; chipeos: number }> = {};
    for (const p of procedimientos) {
      const zona = p.turno?.operativo?.zona;
      const key = zona ? String(zona.id) : 'sin-zona';
      if (!porZona[key]) porZona[key] = { zona: zona?.nombre || 'Sin zona', castraciones: 0, chipeos: 0 };
      if (p.tipo === 'castracion' || p.tipo === 'ambos') porZona[key].castraciones++;
      if (p.tipo === 'chipeo' || p.tipo === 'ambos') porZona[key].chipeos++;
    }

    // % de cumplimiento de operativos (turnos completados / turnos totales, por operativo)
    const operativosWhere: any = {};
    if (desde && hasta) operativosWhere.fecha = { [Op.between]: [desde, hasta] };
    const operativos = await Operativo.findAll({ where: operativosWhere, include: [{ model: Turno, as: 'turnos' }] });
    const cumplimientoOperativos = operativos.map((op) => {
      const turnos = op.turnos || [];
      const completados = turnos.filter((t: any) => t.estado === 'completado').length;
      return {
        operativoId: op.id,
        lugar: op.lugar,
        fecha: op.fecha,
        totalTurnos: turnos.length,
        completados,
        porcentajeCumplimiento: turnos.length ? Math.round((completados / turnos.length) * 100) : 0,
      };
    });

    // Evolución de reportes de avistamiento
    const reportesWhere: any = {};
    if (desde && hasta) reportesWhere.fecha = { [Op.between]: [desde, hasta] };
    const reportes = await ReporteAvistamiento.findAll({ where: reportesWhere });
    const evolucionAvistamientos: Record<string, number> = {};
    for (const r of reportes) {
      const dia = new Date(r.fecha).toISOString().split('T')[0];
      evolucionAvistamientos[dia] = (evolucionAvistamientos[dia] || 0) + 1;
    }

    const totalAnimales = await Animal.count();

    return NextResponse.json({
      desde,
      hasta,
      castracionesYChipeosPorZona: Object.values(porZona),
      cumplimientoOperativos,
      evolucionAvistamientos: Object.entries(evolucionAvistamientos).map(([fecha, cantidad]) => ({ fecha, cantidad })),
      totalAnimalesRegistrados: totalAnimales,
      totalReportesAvistamiento: reportes.length,
      totalProcedimientosRealizados: procedimientos.length,
    });
  } catch (err) {
    console.error('[REPORTES] Error generando estadísticas:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
