'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Zona {
  id: number;
  nombre: string;
}
interface Vecino {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  zonaId: number | null;
  zona?: Zona | null;
}

export default function VecinosPage() {
  const [vecinos, setVecinos] = useState<Vecino[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Vecino | null>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', telefono: '', email: '', direccion: '', zonaId: '' });

  const fetchAll = async () => {
    setLoading(true);
    const [vRes, zRes] = await Promise.all([fetch('/api/vecinos'), fetch('/api/zonas')]);
    setVecinos(await vRes.json());
    setZonas(await zRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditando(null);
    setForm({ nombre: '', apellido: '', dni: '', telefono: '', email: '', direccion: '', zonaId: '' });
    setShowDialog(true);
  };

  const openEdit = (v: Vecino) => {
    setEditando(v);
    setForm({
      nombre: v.nombre,
      apellido: v.apellido,
      dni: v.dni,
      telefono: v.telefono || '',
      email: v.email || '',
      direccion: v.direccion || '',
      zonaId: v.zonaId ? String(v.zonaId) : '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.dni.trim()) {
      toast.error('Nombre, apellido y DNI son obligatorios');
      return;
    }
    const url = editando ? `/api/vecinos/${editando.id}` : '/api/vecinos';
    const method = editando ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, zonaId: form.zonaId ? Number(form.zonaId) : null }),
    });
    if (res.ok) {
      toast.success(editando ? 'Vecino actualizado' : 'Vecino creado');
      setShowDialog(false);
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este vecino?')) return;
    const res = await fetch(`/api/vecinos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Vecino eliminado');
      fetchAll();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vecinos / Solicitantes</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Vecino
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Nombre</TableHead>
                <TableHead className="text-left">DNI</TableHead>
                <TableHead className="text-left">Contacto</TableHead>
                <TableHead className="text-left">Zona</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vecinos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.nombre} {v.apellido}</TableCell>
                  <TableCell>{v.dni}</TableCell>
                  <TableCell>{v.telefono || v.email || '-'}</TableCell>
                  <TableCell>{v.zona?.nombre || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id)}>
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
            <DialogTitle>{editando ? 'Editar Vecino' : 'Nuevo Vecino'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </div>
            <div>
              <Label>DNI</Label>
              <Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <div>
              <Label>Zona</Label>
              <Select value={form.zonaId} onValueChange={(v) => setForm({ ...form, zonaId: v ?? '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona">{(v: string) => zonas.find((z) => String(z.id) === v)?.nombre || 'Seleccionar zona'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {zonas.map((z) => (
                    <SelectItem key={z.id} value={String(z.id)}>{z.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
