'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface Estadisticas {
  castracionesYChipeosPorZona: { zona: string; castraciones: number; chipeos: number }[];
  cumplimientoOperativos: { operativoId: number; lugar: string; fecha: string; totalTurnos: number; completados: number; porcentajeCumplimiento: number }[];
  evolucionAvistamientos: { fecha: string; cantidad: number }[];
  totalAnimalesRegistrados: number;
  totalReportesAvistamiento: number;
  totalProcedimientosRealizados: number;
}

export default function ReportesPage() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [data, setData] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReportes = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const res = await fetch(`/api/reportes/estadisticas?${params.toString()}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reportes Estadísticos</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Filtros</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div>
            <Label>Desde</Label>
            <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <Button onClick={fetchReportes} disabled={loading}>
            <Calendar className="h-4 w-4 mr-2" /> Generar
          </Button>
        </CardContent>
      </Card>

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Animales registrados</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{data.totalAnimalesRegistrados}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Procedimientos realizados</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{data.totalProcedimientosRealizados}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Reportes de avistamiento</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{data.totalReportesAvistamiento}</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Castraciones/Chipeos por Zona</CardTitle></CardHeader>
            <CardContent>
              {data.castracionesYChipeosPorZona.length === 0 ? <p className="text-muted-foreground text-sm">Sin datos en el período.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left">Zona</th><th>Castraciones</th><th>Chipeos</th></tr></thead>
                  <tbody>
                    {data.castracionesYChipeosPorZona.map((z, i) => (
                      <tr key={i} className="border-b"><td>{z.zona}</td><td className="text-center">{z.castraciones}</td><td className="text-center">{z.chipeos}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">% de Cumplimiento por Operativo</CardTitle></CardHeader>
            <CardContent>
              {data.cumplimientoOperativos.length === 0 ? <p className="text-muted-foreground text-sm">Sin datos en el período.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left">Operativo</th><th>Fecha</th><th>Turnos</th><th>Completados</th><th>% Cumplimiento</th></tr></thead>
                  <tbody>
                    {data.cumplimientoOperativos.map((o) => (
                      <tr key={o.operativoId} className="border-b">
                        <td>{o.lugar}</td>
                        <td className="text-center">{new Date(o.fecha).toLocaleDateString('es-AR')}</td>
                        <td className="text-center">{o.totalTurnos}</td>
                        <td className="text-center">{o.completados}</td>
                        <td className="text-center">{o.porcentajeCumplimiento}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Evolución de Reportes de Avistamiento</CardTitle></CardHeader>
            <CardContent>
              {data.evolucionAvistamientos.length === 0 ? <p className="text-muted-foreground text-sm">Sin datos en el período.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left">Fecha</th><th>Cantidad</th></tr></thead>
                  <tbody>
                    {data.evolucionAvistamientos.map((e, i) => (
                      <tr key={i} className="border-b"><td>{e.fecha}</td><td className="text-center">{e.cantidad}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
