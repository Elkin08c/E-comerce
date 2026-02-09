"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  logisticsService,
  type Zone,
  type CreateZoneDto,
  type UpdateZoneDto
} from "@/lib/services/logistics.service";
import { apiClient } from "@/lib/api-client";
import { Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import { geoUtils } from "@/components/maps/map/mapConfig";
import { useGeographic } from "@/components/hooks/useGeographic";
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
import SimpleZoneMap from "@/components/maps/map/SimpleZoneMap";
import { toast } from "sonner";

const ZONE_TYPE_CONFIG = {
  SECURE: {
    label: "Segura",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  RESTRICTED: {
    label: "Restringida",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  DANGER: {
    label: "Peligrosa",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
} as const;

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

  // Estado para el mapa
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Provincia / Ciudad
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const { provinces, citiesByProvince, provincesLoading } = useGeographic();
  const cities = selectedProvinceId ? citiesByProvince(selectedProvinceId) : [];

  // Ref para evitar geocoding duplicado
  const lastGeocodedKey = useRef("");

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
    void fetchZones();
  }, []);

  // Sincronizar polígono con formData + auto-calcular área
  useEffect(() => {
    if (currentPolygon.length > 0) {
      const area = geoUtils.calculatePolygonArea(currentPolygon);
      setFormData((prev) => ({
        ...prev,
        polygon: JSON.stringify(currentPolygon),
        areaKm2: area > 0 ? area.toString() : "",
      }));
    }
  }, [currentPolygon]);

  // Auto-detectar provincia/ciudad usando geocodificación inversa
  const reverseGeocodePolygon = useCallback(
    async (polygon: [number, number][]) => {
      if (polygon.length < 3) return;
      const centroid = geoUtils.calculatePolygonCentroid(polygon);
      const key = `${centroid[0].toFixed(4)},${centroid[1].toFixed(4)}`;
      if (key === lastGeocodedKey.current) return;
      lastGeocodedKey.current = key;

      try {
        const result = await apiClient<any>("/geocoding/reverse", {
          params: { lat: String(centroid[0]), lng: String(centroid[1]) },
        });
        const match = result?.localMatch;
        if (match?.provinceId) {
          setSelectedProvinceId(match.provinceId);
        }
        if (match?.cityId) {
          setFormData((prev) => ({ ...prev, cityId: match.cityId }));
        }
      } catch {
        // Geocoding no crítico — ignorar errores silenciosamente
      }
    },
    [],
  );

  useEffect(() => {
    if (isDrawing && currentPolygon.length >= 3) {
      void reverseGeocodePolygon(currentPolygon);
    }
  }, [currentPolygon, isDrawing, reverseGeocodePolygon]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingZone(null);
    setSelectedProvinceId("");
    lastGeocodedKey.current = "";
  };

  const handleOpenDialog = (zone: Zone) => {
    setEditingZone(zone);
    setSelectedZone(zone);
    setCurrentPolygon(zone.polygon ?? []);
    setSelectedProvinceId(zone.city?.province?.id || "");
    setFormData({
      name: zone.name,
      description: zone.description || "",
      cityId: zone.cityId || "",
      type: zone.type,
      shippingPrice: zone.shippingPrice?.toString() || "",
      areaKm2: zone.areaKm2?.toString() || "",
      polygon: zone.polygon ? JSON.stringify(zone.polygon) : "",
    });
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
        shippingPrice: formData.shippingPrice
          ? parseFloat(formData.shippingPrice)
          : undefined,
        areaKm2: formData.areaKm2
          ? parseFloat(formData.areaKm2)
          : undefined,
        polygon: formData.polygon
          ? JSON.parse(formData.polygon)
          : currentPolygon.length > 0
            ? currentPolygon
            : undefined,
      };

      if (!payload.polygon || payload.polygon.length < 3) {
        toast.error("Dibuja una zona en el mapa (mínimo 3 puntos)");
        setSaving(false);
        return;
      }

      if (editingZone) {
        await logisticsService.updateZone(editingZone.id, payload);
        toast.success("Zona actualizada correctamente");
        setIsDialogOpen(false);
      } else {
        await logisticsService.createZone(payload as CreateZoneDto);
        toast.success("Zona creada correctamente");
      }

      resetForm();
      setCurrentPolygon([]);
      setIsDrawing(false);
      setSelectedZone(null);
      void fetchZones();
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
      void fetchZones();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar zona");
    }
  };

  // Callbacks para el mapa
  const handlePolygonChange = (coordinates: [number, number][]) => {
    setCurrentPolygon(coordinates);
  };

  const handlePolygonComplete = (coordinates: [number, number][]) => {
    setCurrentPolygon(coordinates);
    // Guardar coordenadas en formData, NO abrir dialog (el formulario inline ya es visible)
    setFormData((prev) => ({
      ...prev,
      polygon: JSON.stringify(coordinates),
    }));
  };

  const handleZoneSelectOnMap = (zoneData: {
    id: string;
    polygon: [number, number][];
    type: "SECURE" | "RESTRICTED" | "DANGER";
  }) => {
    const fullZone = zones.find((z) => z.id === zoneData.id);
    if (fullZone) {
      setSelectedZone(fullZone);
      setCurrentPolygon(fullZone.polygon ?? []);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-destructive">Error: {error}</div>;
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold">Zonas de Entrega</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={isDrawing ? "outline" : "default"}
            onClick={() => {
              if (isDrawing) {
                // Cancelar: limpiar todo
                setIsDrawing(false);
                setCurrentPolygon([]);
                resetForm();
              } else {
                // Iniciar dibujo: resetear form e iniciar
                setSelectedZone(null);
                setCurrentPolygon([]);
                resetForm();
                setIsDrawing(true);
              }
            }}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {isDrawing ? "Cancelar dibujo" : "Dibujar nueva zona"}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#1559ED]" />
            Mapa de Zonas
          </h2>
          <span className="text-xs text-muted-foreground">
            {isDrawing
              ? "Haz clic en el mapa para agregar puntos. Doble clic para cerrar el polígono."
              : "Haz clic en el mapa para agregar puntos"}
          </span>
        </div>

        <div className="flex gap-4">
          {/* Formulario inline — visible cuando se está dibujando una nueva zona */}
          {isDrawing && (
            <div className="w-1/3 min-w-[280px]">
              <form
                onSubmit={handleSave}
                className="space-y-4 border rounded-lg p-4 bg-muted/30 h-[500px] overflow-y-auto"
              >
                <h3 className="font-semibold text-sm">Nueva Zona</h3>
                <div className="space-y-2">
                  <Label htmlFor="inline-name">Nombre</Label>
                  <Input
                    id="inline-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-description">Descripción</Label>
                  <Textarea
                    id="inline-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-type">Tipo</Label>
                  <select
                    id="inline-type"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as Zone["type"],
                      })
                    }
                  >
                    <option value="SECURE">Segura</option>
                    <option value="RESTRICTED">Restringida</option>
                    <option value="DANGER">Peligrosa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-province">Provincia</Label>
                  <select
                    id="inline-province"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={selectedProvinceId}
                    onChange={(e) => {
                      setSelectedProvinceId(e.target.value);
                      setFormData({ ...formData, cityId: "" });
                    }}
                    disabled={provincesLoading}
                  >
                    <option value="">Seleccionar provincia…</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-city">Ciudad</Label>
                  <select
                    id="inline-city"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.cityId}
                    onChange={(e) =>
                      setFormData({ ...formData, cityId: e.target.value })
                    }
                    disabled={!selectedProvinceId}
                  >
                    <option value="">Seleccionar ciudad…</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inline-shippingPrice">Precio de Envío ($)</Label>
                  <Input
                    id="inline-shippingPrice"
                    type="number"
                    step={0.01}
                    value={formData.shippingPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingPrice: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área (km²)</Label>
                  <p className="text-sm font-medium tabular-nums">
                    {formData.areaKm2 ? `${formData.areaKm2} km²` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Calculado automáticamente del polígono
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Polígono</Label>
                  <p className="text-xs text-muted-foreground">
                    Puntos: <strong>{currentPolygon.length}</strong>
                    {currentPolygon.length < 3 && " (mínimo 3)"}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDrawing(false);
                      setCurrentPolygon([]);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar zona
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Mapa — ancho completo sin formulario, 2/3 con formulario */}
          <div className={`${isDrawing ? "w-2/3" : "w-full"} h-[500px]`}>
            <SimpleZoneMap
              onPolygonComplete={handlePolygonComplete}
              onPolygonChange={handlePolygonChange}
              isDrawing={isDrawing}
              currentPolygon={currentPolygon}
              completedZones={[]}
              existingZones={zones
                .filter((z) => z.polygon && z.polygon.length >= 3)
                .map((z) => ({
                  id: z.id,
                  name: z.name,
                  polygon: z.polygon as [number, number][],
                  type: z.type,
                }))}
              center={[-1.8312, -78.1834]}
              zoom={7}
              onZoneSelect={handleZoneSelectOnMap}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Puntos actuales: <strong>{currentPolygon.length}</strong>
          </span>
          {isDrawing && (
            <span>
              Doble clic en el mapa para cerrar el polígono.
            </span>
          )}
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-lg overflow-hidden border mt-6">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ciudad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Precio Envío
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Área (km²)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {zones.map((zone) => {
              const typeConfig = ZONE_TYPE_CONFIG[zone.type];
              const isSelected = selectedZone?.id === zone.id;

              return (
                <tr
                  key={zone.id}
                  className={`hover:bg-muted/50 cursor-pointer ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    setSelectedZone(zone);
                    setCurrentPolygon(zone.polygon ?? []);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {zone.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={typeConfig.className}>
                      {typeConfig.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {zone.city?.name || zone.cityId || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {zone.shippingPrice != null
                      ? `$${zone.shippingPrice.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {zone.areaKm2 != null
                      ? zone.areaKm2.toFixed(1)
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(zone);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Estás seguro?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará
                              permanentemente la zona &quot;{zone.name}
                              &quot;.
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
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No hay zonas configuradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Diálogo de creación/edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Zona</DialogTitle>
            <DialogDescription>
              Modifica los datos de la zona seleccionada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-province">Provincia</Label>
                  <select
                    id="dialog-province"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={selectedProvinceId}
                    onChange={(e) => {
                      setSelectedProvinceId(e.target.value);
                      setFormData({ ...formData, cityId: "" });
                    }}
                    disabled={provincesLoading}
                  >
                    <option value="">Seleccionar provincia…</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-city">Ciudad</Label>
                  <select
                    id="dialog-city"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.cityId}
                    onChange={(e) =>
                      setFormData({ ...formData, cityId: e.target.value })
                    }
                    disabled={!selectedProvinceId}
                  >
                    <option value="">Seleccionar ciudad…</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-type">Tipo</Label>
                  <select
                    id="dialog-type"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as Zone["type"],
                      })
                    }
                  >
                    <option value="SECURE">Segura</option>
                    <option value="RESTRICTED">Restringida</option>
                    <option value="DANGER">Peligrosa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingPrice">Precio de Envío ($)</Label>
                  <Input
                    id="shippingPrice"
                    type="number"
                    step={0.01}
                    value={formData.shippingPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingPrice: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Área (km²)</Label>
                <p className="text-sm font-medium tabular-nums">
                  {formData.areaKm2 ? `${formData.areaKm2} km²` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Calculado automáticamente del polígono
                </p>
              </div>

              {/* Campo de polígono solo lectura para depuración */}
              <div className="space-y-2">
                <Label htmlFor="polygon">
                  Polígono (auto-generado desde el mapa)
                </Label>
                <Textarea
                  id="polygon"
                  value={formData.polygon}
                  onChange={(e) =>
                    setFormData({ ...formData, polygon: e.target.value })
                  }
                  rows={3}
                  placeholder="Dibuja la zona en el mapa para rellenar este campo"
                  readOnly
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

