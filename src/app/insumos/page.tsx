'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Insumo {
  id: number;
  nombre: string;
  unidad: string;
  stock: number;
}

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Insumo | null>(null);
  const [form, setForm] = useState({ nombre: '', unidad: 'unidad', stock: '0' });
  const [showMov, setShowMov] = useState<Insumo | null>(null);
  const [movTipo, setMovTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [movCantidad, setMovCantidad] = useState('');

  const fetchInsumos = async () => {
    setLoading(true);
    const res = await fetch('/api/insumos');
    setInsumos(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const openCreate = () => {
    setEditando(null);
    setForm({ nombre: '', unidad: 'unidad', stock: '0' });
    setShowDialog(true);
  };

  const openEdit = (i: Insumo) => {
    setEditando(i);
    setForm({ nombre: i.nombre, unidad: i.unidad, stock: String(i.stock) });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    const url = editando ? `/api/insumos/${editando.id}` : '/api/insumos';
    const method = editando ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: form.nombre, unidad: form.unidad, stock: Number(form.stock) }),
    });
    if (res.ok) {
      toast.success(editando ? 'Insumo actualizado' : 'Insumo creado');
      setShowDialog(false);
      fetchInsumos();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este insumo?')) return;
    const res = await fetch(`/api/insumos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Insumo eliminado');
      fetchInsumos();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  const handleMovimiento = async () => {
    if (!showMov) return;
    const cantidad = Number(movCantidad);
    if (!cantidad || cantidad <= 0) {
      toast.error('Ingresá una cantidad válida');
      return;
    }
    const res = await fetch(`/api/insumos/${showMov.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movimiento: movTipo, cantidad }),
    });
    if (res.ok) {
      toast.success('Movimiento registrado');
      setShowMov(null);
      setMovCantidad('');
      fetchInsumos();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insumos Veterinarios</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Insumo
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Nombre</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insumos.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.nombre}</TableCell>
                  <TableCell className="text-center"><Badge variant={i.stock < 10 ? 'destructive' : 'default'}>{i.stock}</Badge></TableCell>
                  <TableCell className="text-center">{i.unidad}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setShowMov(i)}>
                      <ArrowUpCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(i)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(i.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Insumo' : 'Nuevo Insumo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Unidad</Label>
              <Input value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} placeholder="ml, unidad, dosis..." />
            </div>
            {!editando && (
              <div>
                <Label>Stock inicial</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showMov} onOpenChange={(o) => !o && setShowMov(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movimiento de stock: {showMov?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select value={movTipo} onValueChange={(v) => setMovTipo((v as 'ingreso' | 'egreso') ?? 'ingreso')}>
                <SelectTrigger>
                  <SelectValue>{(v: string) => (v === 'egreso' ? 'Egreso' : 'Ingreso')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" min="1" value={movCantidad} onChange={(e) => setMovCantidad(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowMov(null)}>Cancelar</Button>
            <Button onClick={handleMovimiento}>Registrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
