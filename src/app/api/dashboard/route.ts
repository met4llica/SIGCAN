import { NextRequest, NextResponse } from 'next/server';
import { Animal, Turno, Operativo, Insumo, ReporteAvistamiento } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/middleware';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const hoy = new Date();
  const en7dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalAnimales, turnosPendientes, operativosProximos, insumosBajoStock, reportesPendientes] = await Promise.all([
    Animal.count(),
    Turno.count({ where: { estado: { [Op.in]: ['pendiente', 'confirmado'] } } }),
    Operativo.count({ where: { fecha: { [Op.between]: [hoy, en7dias] }, estado: { [Op.ne]: 'cancelado' } } }),
    Insumo.count({ where: { stock: { [Op.lt]: 10 } } }),
    ReporteAvistamiento.count({ where: { estado: 'pendiente' } }),
  ]);

  return NextResponse.json({ totalAnimales, turnosPendientes, operativosProximos, insumosBajoStock, reportesPendientes });
}
