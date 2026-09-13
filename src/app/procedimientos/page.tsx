'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Turno { id: number; estado: string; animal?: { nombre: string }; operativo?: { lugar: string }; }
interface Veterinario { id: number; nombre: string; apellido: string; }
interface Insumo { id: number; nombre: string; unidad: string; stock: number; }
interface Procedimiento {
  id: number;
  tipo: string;
  fecha: string;
  observaciones: string | null;
  turno?: { animal?: { nombre: string } };
  veterinario?: { nombre: string; apellido: string };
  insumos?: { nombre: string; procedimientoInsumo?: { cantidadUsada: number } }[];
}

export default function ProcedimientosPage() {
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [turnosPendientes, setTurnosPendientes] = useState<Turno[]>([]);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ turnoId: '', veterinarioId: '', tipo: 'ambos', observaciones: '' });
  const [insumosUsados, setInsumosUsados] = useState<{ insumoId: string; cantidadUsada: string }[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, tRes, vRes, iRes] = await Promise.all([
      fetch('/api/procedimientos'),
      fetch('/api/turnos?estado=confirmado'),
      fetch('/api/veterinarios'),
      fetch('/api/insumos'),
    ]);
    setProcedimientos(await pRes.json());
    setTurnosPendientes(await tRes.json());
    setVeterinarios(await vRes.json());
    setInsumos(await iRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setForm({ turnoId: '', veterinarioId: '', tipo: 'ambos', observaciones: '' });
    setInsumosUsados([]);
    setShowDialog(true);
  };

  const addInsumo = () => setInsumosUsados([...insumosUsados, { insumoId: '', cantidadUsada: '' }]);
  const removeInsumo = (idx: number) => setInsumosUsados(insumosUsados.filter((_, i) => i !== idx));
  const updateInsumo = (idx: number, field: 'insumoId' | 'cantidadUsada', value: string) => {
    const next = [...insumosUsados];
    next[idx][field] = value;
    setInsumosUsados(next);
  };

  const handleSave = async () => {
    if (!form.turnoId || !form.veterinarioId) {
      toast.error('Turno y veterinario son obligatorios');
      return;
    }
    const insumosPayload = insumosUsados
      .filter((i) => i.insumoId && i.cantidadUsada)
      .map((i) => ({ insumoId: Number(i.insumoId), cantidadUsada: Number(i.cantidadUsada) }));

    const res = await fetch('/api/procedimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turnoId: Number(form.turnoId),
        veterinarioId: Number(form.veterinarioId),
        tipo: form.tipo,
        observaciones: form.observaciones || null,
        insumos: insumosPayload,
      }),
    });
    if (res.ok) {
      toast.success('Procedimiento registrado: turno completado, stock descontado, historial actualizado');
      setShowDialog(false);
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Registrar Procedimiento Realizado</h1>
        <Button onClick={openCreate} disabled={turnosPendientes.length === 0}>
          <PlusCircle className="h-4 w-4 mr-2" /> Registrar Procedimiento
        </Button>
      </div>
      {turnosPendientes.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay turnos confirmados pendientes de procedimiento.</p>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Animal</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-left">Veterinario</TableHead>
                <TableHead className="text-left">Insumos usados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedimientos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.turno?.animal?.nombre}</TableCell>
                  <TableCell className="text-center"><Badge>{p.tipo}</Badge></TableCell>
                  <TableCell className="text-center">{new Date(p.fecha).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell>{p.veterinario?.nombre} {p.veterinario?.apellido}</TableCell>
                  <TableCell>{p.insumos?.map((i) => i.nombre).join(', ') || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Procedimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Turno</Label>
              <Select value={form.turnoId} onValueChange={(v) => setForm({ ...form, turnoId: v ?? '' })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar turno confirmado">{(v: string) => { const t = turnosPendientes.find((x) => String(x.id) === v); return t ? `${t.animal?.nombre} — ${t.operativo?.lugar}` : 'Seleccionar turno confirmado'; }}</SelectValue></SelectTrigger>
                <SelectContent>
                  {turnosPendientes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.animal?.nombre} — {t.operativo?.lugar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Veterinario</Label>
              <Select value={form.veterinarioId} onValueChange={(v) => setForm({ ...form, veterinarioId: v ?? '' })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar veterinario">{(v: string) => { const vet = veterinarios.find((x) => String(x.id) === v); return vet ? `${vet.nombre} ${vet.apellido}` : 'Seleccionar veterinario'; }}</SelectValue></SelectTrigger>
                <SelectContent>
                  {veterinarios.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.nombre} {v.apellido}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v ?? 'ambos' })}>
                <SelectTrigger><SelectValue>{(v: string) => ({ castracion: 'Castración', chipeo: 'Chipeo', ambos: 'Ambos' }[v] || 'Ambos')}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="castracion">Castración</SelectItem>
                  <SelectItem value="chipeo">Chipeo</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Insumos utilizados</Label>
              <div className="space-y-2">
                {insumosUsados.map((iu, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Select value={iu.insumoId} onValueChange={(v) => updateInsumo(idx, 'insumoId', v ?? '')}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Insumo">{(v: string) => { const ins = insumos.find((x) => String(x.id) === v); return ins ? `${ins.nombre} (stock: ${ins.stock})` : 'Insumo'; }}</SelectValue></SelectTrigger>
                      <SelectContent>
                        {insumos.map((i) => <SelectItem key={i.id} value={String(i.id)}>{i.nombre} (stock: {i.stock})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Cant."
                      className="w-24"
                      value={iu.cantidadUsada}
                      onChange={(e) => updateInsumo(idx, 'cantidadUsada', e.target.value)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeInsumo(idx)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addInsumo}>+ Agregar insumo</Button>
              </div>
            </div>
            <div>
              <Label>Observaciones</Label>
              <Textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
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
