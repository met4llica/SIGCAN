'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'operador' | 'veterinario';
  activo: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'operador', activo: true });

  const fetchUsuarios = async () => {
    setLoading(true);
    const res = await fetch('/api/usuarios');
    if (res.ok) setUsuarios(await res.json());
    else if (res.status === 403) toast.error('Solo el administrador puede ver esta sección');
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const openCreate = () => {
    setEditando(null);
    setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'operador', activo: true });
    setShowDialog(true);
  };

  const openEdit = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: '', rol: u.rol, activo: u.activo });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (!editando && (!form.password || form.password.length < 6)) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    const url = editando ? `/api/usuarios/${editando.id}` : '/api/usuarios';
    const method = editando ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      toast.success(editando ? 'Usuario actualizado' : 'Usuario creado');
      setShowDialog(false);
      fetchUsuarios();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Usuario eliminado');
      fetchUsuarios();
    } else {
      toast.error('Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuarios y Roles del Sistema</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Usuario
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Nombre</TableHead>
                <TableHead className="text-left">Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nombre} {u.apellido}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="text-center"><Badge>{u.rol}</Badge></TableCell>
                  <TableCell className="text-center">{u.activo ? 'Sí' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(u.id)}>
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
            <DialogTitle>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
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
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {!editando && (
              <div>
                <Label>Contraseña</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            )}
            <div>
              <Label>Rol</Label>
              <Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v ?? 'operador' })}>
                <SelectTrigger><SelectValue>{(v: string) => ({ admin: 'Administrador', operador: 'Operador', veterinario: 'Veterinario' }[v] || 'Operador')}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="veterinario">Veterinario</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editando && (
              <div className="flex items-center gap-2">
                <Switch checked={form.activo} onCheckedChange={(c) => setForm({ ...form, activo: c })} />
                <Label>Activo</Label>
              </div>
            )}
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
