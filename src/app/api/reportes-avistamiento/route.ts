import { NextRequest, NextResponse } from 'next/server';
import { ReporteAvistamiento, Vecino, Zona } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const reportes = await ReporteAvistamiento.findAll({
    include: [{ model: Vecino, as: 'vecino' }, { model: Zona, as: 'zona' }],
    order: [['fecha', 'DESC']],
  });
  return NextResponse.json(reportes);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { vecinoId, zonaId, descripcion } = await req.json();
    if (!zonaId) return NextResponse.json({ error: 'La zona es obligatoria' }, { status: 400 });
    if (!descripcion || !descripcion.trim()) return NextResponse.json({ error: 'La descripción es obligatoria' }, { status: 400 });

    const reporte = await ReporteAvistamiento.create({ vecinoId: vecinoId || null, zonaId, descripcion });
    return NextResponse.json(reporte, { status: 201 });
  } catch (err) {
    console.error('[REPORTE-AVISTAMIENTO] Error creando:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
