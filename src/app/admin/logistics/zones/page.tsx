"use client";

import { useEffect, useState } from "react";
import {
  logisticsService,
  Zone,
  CreateZoneDto,
  UpdateZoneDto,
} from "@/lib/services/logistics.service";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ZONE_TYPE_CONFIG = {
  SECURE: { label: "Segura", variant: "default" as const, className: "bg-green-100 text-green-800 hover:bg-green-100" },
  RESTRICTED: { label: "Restringida", variant: "default" as const, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  DANGER: { label: "Peligrosa", variant: "default" as const, className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

const emptyForm = {
  name: "",
  description: "",
  cityId: "",
  type: "SECURE" as Zone["type"],
  shippingPrice: "",
  areaKm2: "",
  polygon: "",
};

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await logisticsService.getZones();
      setZones(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar zonas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingZone(null);
  };

  const handleOpenDialog = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        description: zone.description || "",
        cityId: zone.cityId || "",
        type: zone.type,
        shippingPrice: zone.shippingPrice?.toString() || "",
        areaKm2: zone.areaKm2?.toString() || "",
        polygon: zone.polygon ? JSON.stringify(zone.polygon) : "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: CreateZoneDto | UpdateZoneDto = {
        name: formData.name,
        description: formData.description || undefined,
        cityId: formData.cityId || undefined,
        type: formData.type,
        shippingPrice: formData.shippingPrice ? parseFloat(formData.shippingPrice) : undefined,
        areaKm2: formData.areaKm2 ? parseFloat(formData.areaKm2) : undefined,
        polygon: formData.polygon ? JSON.parse(formData.polygon) : undefined,
      };

      if (editingZone) {
        await logisticsService.updateZone(editingZone.id, payload);
        toast.success("Zona actualizada correctamente");
      } else {
        await logisticsService.createZone(payload as CreateZoneDto);
        toast.success("Zona creada correctamente");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchZones();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar zona");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await logisticsService.deleteZone(id);
      toast.success("Zona eliminada");
      fetchZones();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar zona");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-8 text-destructive">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold">Zonas de Entrega</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Zona
        </Button>
      </div>

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ciudad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Precio Envío</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Área (km²)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {zones.map((zone) => {
              const typeConfig = ZONE_TYPE_CONFIG[zone.type];
              return (
                <tr key={zone.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{zone.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {zone.city?.name || zone.cityId || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {zone.shippingPrice != null ? `$${zone.shippingPrice.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {zone.areaKm2 != null ? zone.areaKm2.toFixed(1) : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      zone.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {zone.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(zone)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente la zona &quot;{zone.name}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(zone.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              );
            })}
            {zones.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No hay zonas configuradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingZone ? "Editar Zona" : "Nueva Zona"}</DialogTitle>
            <DialogDescription>
              Ingresa los detalles de la zona de entrega.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cityId">ID de Ciudad</Label>
                  <Input
                    id="cityId"
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as Zone["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SECURE">Segura</SelectItem>
                      <SelectItem value="RESTRICTED">Restringida</SelectItem>
                      <SelectItem value="DANGER">Peligrosa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingPrice">Precio de Envío ($)</Label>
                  <Input
                    id="shippingPrice"
                    type="number"
                    step="0.01"
                    value={formData.shippingPrice}
                    onChange={(e) => setFormData({ ...formData, shippingPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="areaKm2">Área (km²)</Label>
                  <Input
                    id="areaKm2"
                    type="number"
                    step="0.1"
                    value={formData.areaKm2}
                    onChange={(e) => setFormData({ ...formData, areaKm2: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="polygon">Polígono (JSON)</Label>
                <Textarea
                  id="polygon"
                  value={formData.polygon}
                  onChange={(e) => setFormData({ ...formData, polygon: e.target.value })}
                  rows={3}
                  placeholder='[[lat, lng], [lat, lng], ...]'
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
