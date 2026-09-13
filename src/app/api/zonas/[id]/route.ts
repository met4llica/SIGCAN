import { NextRequest, NextResponse } from 'next/server';
import { Zona, Operativo, ReporteAvistamiento } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { nombre } = await req.json();
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });

  const zona = await Zona.findByPk(id);
  if (!zona) return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 });

  try {
    zona.nombre = nombre;
    await zona.save();
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'La zona ya existe' }, { status: 409 });
    }
    throw err;
  }
  return NextResponse.json(zona);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const zona = await Zona.findByPk(id);
  if (!zona) return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 });

  const [operativos, reportes] = await Promise.all([
    Operativo.count({ where: { zonaId: id } }),
    ReporteAvistamiento.count({ where: { zonaId: id } }),
  ]);
  if (operativos > 0 || reportes > 0) {
    return NextResponse.json({ error: 'No se puede eliminar una zona con operativos o reportes asociados' }, { status: 400 });
  }

  await zona.destroy();
  return NextResponse.json({ message: 'Zona eliminada' });
}
