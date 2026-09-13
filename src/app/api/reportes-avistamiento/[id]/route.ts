import { NextRequest, NextResponse } from 'next/server';
import { ReporteAvistamiento } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

type Params = { params: Promise<{ id: string }> };

// PATCH — asignar intervención (marcar como atendido)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const reporte = await ReporteAvistamiento.findByPk(id);
  if (!reporte) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });

  reporte.estado = 'atendido';
  await reporte.save();
  return NextResponse.json(reporte);
}
