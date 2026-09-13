'use client';
import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HistorialEntry {
  id: number;
  fecha: string;
  descripcion: string;
  procedimiento?: { tipo: string; veterinario?: { nombre: string; apellido: string } };
}
interface Animal {
  id: number;
  nombre: string;
  especie: string;
  sexo: string;
  condicion: string;
}

export default function HistorialAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/historial/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAnimal(data.animal);
        setHistorial(data.historial || []);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historial Clínico{animal ? `: ${animal.nombre}` : ''}</h1>
        {animal && <p className="text-muted-foreground">{animal.especie} · {animal.sexo} · {animal.condicion === 'callejero' ? 'Callejero' : 'Con tutor'}</p>}
      </div>

      {historial.length === 0 ? (
        <p className="text-muted-foreground">Sin procedimientos registrados todavía.</p>
      ) : (
        <div className="space-y-3">
          {historial.map((h) => (
            <Card key={h.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{new Date(h.fecha).toLocaleDateString('es-AR')}</CardTitle>
                {h.procedimiento && <Badge>{h.procedimiento.tipo}</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-sm">{h.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
