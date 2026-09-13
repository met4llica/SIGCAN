'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dog, CalendarClock, Stethoscope, PackageX, Eye } from 'lucide-react';

interface Stats {
  totalAnimales: number;
  turnosPendientes: number;
  operativosProximos: number;
  insumosBajoStock: number;
  reportesPendientes: number;
}

const secciones = [
  { href: '/turnos', titulo: 'Turnos', desc: 'Solicitar, confirmar, reprogramar y cancelar' },
  { href: '/operativos', titulo: 'Operativos', desc: 'Jornadas de castración/chipeo por zona' },
  { href: '/procedimientos', titulo: 'Procedimientos', desc: 'Registrar castración/chipeo realizado' },
  { href: '/vecinos', titulo: 'Vecinos', desc: 'Solicitantes de turnos para sus animales' },
  { href: '/animales', titulo: 'Animales', desc: 'Fichas de caninos registrados' },
  { href: '/veterinarios', titulo: 'Veterinarios', desc: 'Personal actuante en los operativos' },
  { href: '/insumos', titulo: 'Insumos', desc: 'Stock de anestesia, chips, material' },
  { href: '/avistamientos', titulo: 'Avistamientos', desc: 'Reportes de perros sueltos/asilvestrados' },
  { href: '/reportes', titulo: 'Reportes Estadísticos', desc: 'Cobertura, cumplimiento, evolución' },
];

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard').then((r) => (r.ok ? r.json() : null)).then(setStats);
  }, []);

  const kpis = stats
    ? [
        { label: 'Animales registrados', value: stats.totalAnimales, icon: Dog, tone: 'text-primary' },
        { label: 'Turnos activos', value: stats.turnosPendientes, icon: CalendarClock, tone: 'text-primary' },
        { label: 'Operativos próx. 7 días', value: stats.operativosProximos, icon: Stethoscope, tone: 'text-primary' },
        { label: 'Insumos con stock bajo', value: stats.insumosBajoStock, icon: PackageX, tone: stats.insumosBajoStock > 0 ? 'text-destructive' : 'text-primary' },
        { label: 'Avistamientos pendientes', value: stats.reportesPendientes, icon: Eye, tone: stats.reportesPendientes > 0 ? 'text-accent' : 'text-primary' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SIGCAN</h1>
        <p className="text-muted-foreground">Gestión de turnos y registro de castración y chipeo animal — Municipio de Río Grande</p>
      </div>

      {stats && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {kpis.map((k) => (
            <Card key={k.label}>
              <CardContent className="pt-6">
                <k.icon className={`h-5 w-5 mb-2 ${k.tone}`} />
                <div className="text-2xl font-bold">{k.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Secciones</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secciones.map((s) => (
            <a key={s.href} href={s.href}>
              <Card className="h-full hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">{s.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
