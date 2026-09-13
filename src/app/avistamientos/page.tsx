'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Zona { id: number; nombre: string; }
interface Reporte {
  id: number;
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'atendido';
  zona?: Zona;
  vecino?: { nombre: string; apellido: string } | null;
}

export default function AvistamientosPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ zonaId: '', descripcion: '' });

  const fetchAll = async () => {
    setLoading(true);
    const [rRes, zRes] = await Promise.all([fetch('/api/reportes-avistamiento'), fetch('/api/zonas')]);
    setReportes(await rRes.json());
    setZonas(await zRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async () => {
    if (!form.zonaId || !form.descripcion.trim()) {
      toast.error('Zona y descripción son obligatorias');
      return;
    }
    const res = await fetch('/api/reportes-avistamiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zonaId: Number(form.zonaId), descripcion: form.descripcion }),
    });
    if (res.ok) {
      toast.success('Reporte registrado');
      setShowDialog(false);
      setForm({ zonaId: '', descripcion: '' });
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const marcarAtendido = async (id: number) => {
    const res = await fetch(`/api/reportes-avistamiento/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (res.ok) {
      toast.success('Reporte marcado como atendido');
      fetchAll();
    } else {
      toast.error('Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reportes de Avistamiento</h1>
        <Button onClick={() => setShowDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Reporte
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Fecha</TableHead>
                <TableHead className="text-left">Zona</TableHead>
                <TableHead className="text-left">Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.fecha).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell>{r.zona?.nombre}</TableCell>
                  <TableCell>{r.descripcion}</TableCell>
                  <TableCell className="text-center"><Badge variant={r.estado === 'pendiente' ? 'destructive' : 'default'}>{r.estado}</Badge></TableCell>
                  <TableCell className="text-right">
                    {r.estado === 'pendiente' && (
                      <Button size="sm" variant="ghost" onClick={() => marcarAtendido(r.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Reporte de Avistamiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: jauría de 5 perros cerca de la escuela..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Registrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
