'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Zona {
  id: number;
  nombre: string;
}

export default function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<Zona | null>(null);
  const [nombre, setNombre] = useState('');

  const fetchZonas = async () => {
    setLoading(true);
    const res = await fetch('/api/zonas');
    setZonas(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchZonas();
  }, []);

  const openCreate = () => {
    setEditando(null);
    setNombre('');
    setShowDialog(true);
  };

  const openEdit = (z: Zona) => {
    setEditando(z);
    setNombre(z.nombre);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    const url = editando ? `/api/zonas/${editando.id}` : '/api/zonas';
    const method = editando ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) });
    if (res.ok) {
      toast.success(editando ? 'Zona actualizada' : 'Zona creada');
      setShowDialog(false);
      fetchZonas();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta zona?')) return;
    const res = await fetch(`/api/zonas/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Zona eliminada');
      fetchZonas();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Zonas / Barrios</h1>
        <Button onClick={openCreate}>
          <PlusCircle className="h-4 w-4 mr-2" /> Nueva Zona
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {zonas.map((z) => (
            <Card key={z.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{z.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(z)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(z.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Zona' : 'Nueva Zona'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
