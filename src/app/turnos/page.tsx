'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Check, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Animal { id: number; nombre: string; }
interface Operativo { id: number; lugar: string; fecha: string; }
interface Turno {
  id: number;
  fecha: string;
  estado: string;
  animal?: Animal;
  operativo?: Operativo;
}

const badgeVariant: Record<string, any> = {
  pendiente: 'outline',
  confirmado: 'default',
  completado: 'secondary',
  cancelado: 'destructive',
  reprogramado: 'outline',
};

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [operativos, setOperativos] = useState<Operativo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ animalId: '', operativoId: '' });

  const fetchAll = async () => {
    setLoading(true);
    const [tRes, aRes, oRes] = await Promise.all([fetch('/api/turnos'), fetch('/api/animales'), fetch('/api/operativos')]);
    setTurnos(await tRes.json());
    setAnimales(await aRes.json());
    setOperativos(await oRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setForm({ animalId: '', operativoId: '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.animalId || !form.operativoId) {
      toast.error('Animal y operativo son obligatorios');
      return;
    }
    const res = await fetch('/api/turnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ animalId: Number(form.animalId), operativoId: Number(form.operativoId) }),
    });
    if (res.ok) {
      toast.success('Turno solicitado');
      setShowDialog(false);
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    const res = await fetch(`/api/turnos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    if (res.ok) {
      toast.success(`Turno ${estado}`);
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Turnos</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Solicitar Turno
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Animal</TableHead>
                <TableHead className="text-left">Operativo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turnos.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.animal?.nombre}</TableCell>
                  <TableCell>{t.operativo?.lugar}</TableCell>
                  <TableCell className="text-center">{new Date(t.fecha).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell className="text-center"><Badge variant={badgeVariant[t.estado]}>{t.estado}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    {t.estado === 'pendiente' && (
                      <Button size="sm" variant="ghost" onClick={() => cambiarEstado(t.id, 'confirmado')} title="Confirmar">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {['pendiente', 'confirmado'].includes(t.estado) && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => cambiarEstado(t.id, 'cancelado')} title="Cancelar">
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => cambiarEstado(t.id, 'reprogramado')} title="Reprogramar (misma fecha, marca reprogramado)">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
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
            <DialogTitle>Solicitar Turno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Animal</Label>
              <Select value={form.animalId} onValueChange={(v) => setForm({ ...form, animalId: v ?? '' })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar animal">{(v: string) => animales.find((a) => String(a.id) === v)?.nombre || 'Seleccionar animal'}</SelectValue></SelectTrigger>
                <SelectContent>
                  {animales.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operativo</Label>
              <Select value={form.operativoId} onValueChange={(v) => setForm({ ...form, operativoId: v ?? '' })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar operativo">{(v: string) => { const o = operativos.find((x) => String(x.id) === v); return o ? `${o.lugar} — ${new Date(o.fecha).toLocaleDateString('es-AR')}` : 'Seleccionar operativo'; }}</SelectValue></SelectTrigger>
                <SelectContent>
                  {operativos.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.lugar} — {new Date(o.fecha).toLocaleDateString('es-AR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Solicitar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
