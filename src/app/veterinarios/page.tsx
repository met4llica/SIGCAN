'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Veterinario {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string | null;
  activo: boolean;
}

export default function VeterinariosPage() {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Veterinario | null>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', matricula: '', especialidad: '' });

  const fetchVeterinarios = async () => {
    setLoading(true);
    const res = await fetch('/api/veterinarios');
    setVeterinarios(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchVeterinarios();
  }, []);

  const openCreate = () => {
    setEditando(null);
    setForm({ nombre: '', apellido: '', matricula: '', especialidad: '' });
    setShowDialog(true);
  };

  const openEdit = (v: Veterinario) => {
    setEditando(v);
    setForm({ nombre: v.nombre, apellido: v.apellido, matricula: v.matricula, especialidad: v.especialidad || '' });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.matricula.trim()) {
      toast.error('Nombre, apellido y matrícula son obligatorios');
      return;
    }
    const url = editando ? `/api/veterinarios/${editando.id}` : '/api/veterinarios';
    const method = editando ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success(editando ? 'Veterinario actualizado' : 'Veterinario creado');
      setShowDialog(false);
      fetchVeterinarios();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este veterinario?')) return;
    const res = await fetch(`/api/veterinarios/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Veterinario eliminado');
      fetchVeterinarios();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Veterinarios / Personal Actuante</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Veterinario
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Nombre</TableHead>
                <TableHead className="text-left">Matrícula</TableHead>
                <TableHead className="text-left">Especialidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veterinarios.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.nombre} {v.apellido}</TableCell>
                  <TableCell>{v.matricula}</TableCell>
                  <TableCell>{v.especialidad || '-'}</TableCell>
                  <TableCell>{v.activo ? <Badge>Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}</TableCell>
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
            <DialogTitle>{editando ? 'Editar Veterinario' : 'Nuevo Veterinario'}</DialogTitle>
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
              <Label>Matrícula</Label>
              <Input value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} />
            </div>
            <div>
              <Label>Especialidad</Label>
              <Input value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} />
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
