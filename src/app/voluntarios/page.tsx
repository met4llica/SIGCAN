'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Voluntario {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string | null;
  disponibilidad: string | null;
}

export default function VoluntariosPage() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Voluntario | null>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', disponibilidad: '' });

  const fetchVoluntarios = async () => {
    setLoading(true);
    const res = await fetch('/api/voluntarios');
    setVoluntarios(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchVoluntarios();
  }, []);

  const openCreate = () => {
    setEditando(null);
    setForm({ nombre: '', apellido: '', telefono: '', disponibilidad: '' });
    setShowDialog(true);
  };

  const openEdit = (v: Voluntario) => {
    setEditando(v);
    setForm({ nombre: v.nombre, apellido: v.apellido, telefono: v.telefono || '', disponibilidad: v.disponibilidad || '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.apellido.trim()) {
      toast.error('Nombre y apellido son obligatorios');
      return;
    }
    const url = editando ? `/api/voluntarios/${editando.id}` : '/api/voluntarios';
    const method = editando ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success(editando ? 'Voluntario actualizado' : 'Voluntario creado');
      setShowDialog(false);
      fetchVoluntarios();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este voluntario?')) return;
    const res = await fetch(`/api/voluntarios/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Voluntario eliminado');
      fetchVoluntarios();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Voluntarios</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Voluntario
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Nombre</TableHead>
                <TableHead className="text-left">Teléfono</TableHead>
                <TableHead className="text-left">Disponibilidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voluntarios.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.nombre} {v.apellido}</TableCell>
                  <TableCell>{v.telefono || '-'}</TableCell>
                  <TableCell>{v.disponibilidad || '-'}</TableCell>
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
            <DialogTitle>{editando ? 'Editar Voluntario' : 'Nuevo Voluntario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <Label>Disponibilidad</Label>
              <Input value={form.disponibilidad} onChange={(e) => setForm({ ...form, disponibilidad: e.target.value })} placeholder="Ej: fines de semana" />
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
