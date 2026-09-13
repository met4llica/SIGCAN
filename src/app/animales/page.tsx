'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, FileText, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Vecino {
  id: number;
  nombre: string;
  apellido: string;
}
interface Animal {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: 'macho' | 'hembra';
  edadEstimada: number | null;
  condicion: 'con_tutor' | 'callejero';
  vecinoId: number | null;
  vecino?: Vecino | null;
}

export default function AnimalesPage() {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [vecinos, setVecinos] = useState<Vecino[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Animal | null>(null);
  const [form, setForm] = useState({ nombre: '', especie: 'canino', raza: '', sexo: 'macho', edadEstimada: '', condicion: 'con_tutor', vecinoId: '' });

  const fetchAnimales = async () => {
    setLoading(true);
    const res = await fetch(`/api/animales${search ? `?q=${encodeURIComponent(search)}` : ''}`);
    setAnimales(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAnimales();
    fetch('/api/vecinos').then((r) => r.json()).then(setVecinos);
  }, []);

  const openCreate = () => {
    setEditando(null);
    setForm({ nombre: '', especie: 'canino', raza: '', sexo: 'macho', edadEstimada: '', condicion: 'con_tutor', vecinoId: '' });
    setShowDialog(true);
  };

  const openEdit = (a: Animal) => {
    setEditando(a);
    setForm({
      nombre: a.nombre,
      especie: a.especie,
      raza: a.raza || '',
      sexo: a.sexo,
      edadEstimada: a.edadEstimada ? String(a.edadEstimada) : '',
      condicion: a.condicion,
      vecinoId: a.vecinoId ? String(a.vecinoId) : '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (form.condicion === 'con_tutor' && !form.vecinoId) {
      toast.error('Un animal con tutor debe tener un vecino asociado');
      return;
    }
    const url = editando ? `/api/animales/${editando.id}` : '/api/animales';
    const method = editando ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        edadEstimada: form.edadEstimada ? Number(form.edadEstimada) : null,
        vecinoId: form.vecinoId ? Number(form.vecinoId) : null,
      }),
    });
    if (res.ok) {
      toast.success(editando ? 'Animal actualizado' : 'Animal creado');
      setShowDialog(false);
      fetchAnimales();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este animal?')) return;
    const res = await fetch(`/api/animales/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Animal eliminado');
      fetchAnimales();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Animales (Caninos)</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Animal
        </Button>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="outline" onClick={fetchAnimales}><Search className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Nombre</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Condición</TableHead>
                <TableHead className="text-left">Tutor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animales.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.nombre} <span className="text-muted-foreground text-xs">{a.raza}</span></TableCell>
                  <TableCell className="text-center">{a.sexo}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={a.condicion === 'callejero' ? 'destructive' : 'default'}>
                      {a.condicion === 'callejero' ? 'Callejero' : 'Con tutor'}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.vecino ? `${a.vecino.nombre} ${a.vecino.apellido}` : '-'}</TableCell>
                  <TableCell className="text-right">
                    <a href={`/animales/${a.id}/historial`}>
                      <Button size="sm" variant="ghost"><FileText className="h-4 w-4" /></Button>
                    </a>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
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
            <DialogTitle>{editando ? 'Editar Animal' : 'Nuevo Animal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Raza (aprox.)</Label>
              <Input value={form.raza} onChange={(e) => setForm({ ...form, raza: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sexo</Label>
                <Select value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v ?? 'macho' })}>
                  <SelectTrigger><SelectValue>{(v: string) => (v === 'hembra' ? 'Hembra' : 'Macho')}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Edad estimada</Label>
                <Input type="number" min="0" value={form.edadEstimada} onChange={(e) => setForm({ ...form, edadEstimada: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Condición</Label>
              <Select value={form.condicion} onValueChange={(v) => setForm({ ...form, condicion: v ?? 'con_tutor' })}>
                <SelectTrigger><SelectValue>{(v: string) => (v === 'callejero' ? 'Callejero / asilvestrado' : 'Con tutor')}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="con_tutor">Con tutor</SelectItem>
                  <SelectItem value="callejero">Callejero / asilvestrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.condicion === 'con_tutor' && (
              <div>
                <Label>Tutor (vecino)</Label>
                <Select value={form.vecinoId} onValueChange={(v) => setForm({ ...form, vecinoId: v ?? '' })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar vecino">{(v: string) => { const found = vecinos.find((x) => String(x.id) === v); return found ? `${found.nombre} ${found.apellido}` : 'Seleccionar vecino'; }}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {vecinos.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.nombre} {v.apellido}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
