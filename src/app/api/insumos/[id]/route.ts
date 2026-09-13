import { NextRequest, NextResponse } from 'next/server';
import { Insumo, ProcedimientoInsumo } from '@/lib/db';
import { getAuthenticatedUser, checkRole } from '@/lib/middleware';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/insumos/[id] — editar datos, o registrar movimiento de stock (body: { movimiento: 'ingreso'|'egreso', cantidad })
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin', 'operador'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const insumo = await Insumo.findByPk(id);
  if (!insumo) return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });

  if (body.movimiento) {
    const cantidad = Number(body.cantidad);
    if (!cantidad || cantidad <= 0) {
      return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 400 });
    }
    if (body.movimiento === 'ingreso') {
      insumo.stock += cantidad;
    } else if (body.movimiento === 'egreso') {
      if (cantidad > insumo.stock) {
        return NextResponse.json({ error: 'La cantidad supera el stock disponible' }, { status: 400 });
      }
      insumo.stock -= cantidad;
    } else {
      return NextResponse.json({ error: 'Movimiento inválido' }, { status: 400 });
    }
    await insumo.save();
    return NextResponse.json(insumo);
  }

  const { nombre, unidad } = body;
  if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  insumo.nombre = nombre;
  insumo.unidad = unidad || insumo.unidad;
  await insumo.save();
  return NextResponse.json(insumo);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!checkRole(user, ['admin'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const insumo = await Insumo.findByPk(id);
  if (!insumo) return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });

  const usos = await ProcedimientoInsumo.count({ where: { insumoId: id } });
  if (usos > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un insumo con procedimientos asociados' }, { status: 400 });
  }

  await insumo.destroy();
  return NextResponse.json({ message: 'Insumo eliminado' });
}
