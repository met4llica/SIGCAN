import { NextRequest, NextResponse } from 'next/server';
import { HistorialClinico, Procedimiento, Veterinario, Animal } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/middleware';

type Params = { params: Promise<{ animalId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { animalId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const animal = await Animal.findByPk(animalId);
  if (!animal) return NextResponse.json({ error: 'Animal no encontrado' }, { status: 404 });

  const historial = await HistorialClinico.findAll({
    where: { animalId },
    include: [{ model: Procedimiento, as: 'procedimiento', include: [{ model: Veterinario, as: 'veterinario' }] }],
    order: [['fecha', 'DESC']],
  });

  return NextResponse.json({ animal, historial });
}
