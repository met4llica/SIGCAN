'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Zona { id: number; nombre: string; }
interface Veterinario { id: number; nombre: string; apellido: string; }
interface Operativo {
  id: number;
  fecha: string;
  lugar: string;
  zonaId: number;
  zona?: Zona;
  cupoMaximo: number;
  cupoOcupado: number;
  cupoDisponible: number;
  estado: string;
  veterinarios?: Veterinario[];
}

export default function OperativosPage() {
  const [operativos, setOperativos] = useState<Operativo[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ fecha: '', lugar: '', zonaId: '', cupoMaximo: '10', veterinarioIds: [] as number[] });

  const fetchAll = async () => {
    setLoading(true);
    const [oRes, zRes, vRes] = await Promise.all([fetch('/api/operativos'), fetch('/api/zonas'), fetch('/api/veterinarios')]);
    setOperativos(await oRes.json());
    setZonas(await zRes.json());
    setVeterinarios(await vRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setForm({ fecha: '', lugar: '', zonaId: '', cupoMaximo: '10', veterinarioIds: [] });
    setShowDialog(true);
  };

  const toggleVet = (id: number) => {
    setForm((f) => ({
      ...f,
      veterinarioIds: f.veterinarioIds.includes(id) ? f.veterinarioIds.filter((x) => x !== id) : [...f.veterinarioIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.fecha || !form.lugar.trim() || !form.zonaId) {
      toast.error('Fecha, lugar y zona son obligatorios');
      return;
    }
    const res = await fetch('/api/operativos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, zonaId: Number(form.zonaId), cupoMaximo: Number(form.cupoMaximo) }),
    });
    if (res.ok) {
      toast.success('Operativo creado');
      setShowDialog(false);
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('¿Cancelar este operativo? Se cancelarán en cascada todos sus turnos.')) return;
    const res = await fetch(`/api/operativos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'cancelado' }),
    });
    if (res.ok) {
      toast.success('Operativo cancelado (turnos en cascada)');
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Operativos / Jornadas</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Operativo
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {operativos.map((op) => (
            <Card key={op.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{op.lugar}</CardTitle>
                <Badge variant={op.estado === 'cancelado' ? 'destructive' : op.estado === 'finalizado' ? 'secondary' : 'default'}>
                  {op.estado}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>{new Date(op.fecha).toLocaleDateString('es-AR')} — Zona: {op.zona?.nombre}</p>
                <p>Cupo: {op.cupoOcupado}/{op.cupoMaximo} ocupado ({op.cupoDisponible} disponibles)</p>
                <p>Veterinarios: {op.veterinarios?.map((v) => `${v.nombre} ${v.apellido}`).join(', ') || '-'}</p>
                {op.estado !== 'cancelado' && (
                  <Button size="sm" variant="destructive" className="mt-2" onClick={() => handleCancelar(op.id)}>
                    <XCircle className="h-4 w-4 mr-1" /> Cancelar operativo
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Operativo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div>
              <Label>Lugar</Label>
              <Input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
            </div>
            <div>
              <Label>Zona</Label>
              <Select value={form.zonaId} onValueChange={(v) => setForm({ ...form, zonaId: v ?? '' })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar zona">{(v: string) => zonas.find((z) => String(z.id) === v)?.nombre || 'Seleccionar zona'}</SelectValue></SelectTrigger>
                <SelectContent>
                  {zonas.map((z) => <SelectItem key={z.id} value={String(z.id)}>{z.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cupo máximo</Label>
              <Input type="number" min="1" value={form.cupoMaximo} onChange={(e) => setForm({ ...form, cupoMaximo: e.target.value })} />
            </div>
            <div>
              <Label>Veterinarios asignados</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {veterinarios.map((v) => (
                  <Badge
                    key={v.id}
                    variant={form.veterinarioIds.includes(v.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleVet(v.id)}
                  >
                    {v.nombre} {v.apellido}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
