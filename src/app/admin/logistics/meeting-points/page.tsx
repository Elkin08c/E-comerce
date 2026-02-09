"use client";

import { useEffect, useState, useMemo } from "react";
import {
  logisticsService,
  type MeetingPoint,
  type Zone,
  type CreateMeetingPointDto,
  type UpdateMeetingPointDto,
} from "@/lib/services/logistics.service";
import { Plus, Pencil, Trash2, Loader2, Search, MapPin } from "lucide-react";
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
import MeetingPointMap from "@/components/maps/meetingPoints/MeetingPointMap";
import MeetingPointsList from "@/components/maps/meetingPoints/MeetingPointsList";
import { toast } from "sonner";

const emptyForm = {
  zoneId: "",
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  description: "",
  reference: "",
  contactPhone: "",
  openingHours: "",
  capacity: "",
  priority: "0",
};

export default function MeetingPointsPage() {
  const [points, setPoints] = useState<MeetingPoint[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<MeetingPoint | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  // Estado para integración con el mapa
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedZoneIdForMap, setSelectedZoneIdForMap] = useState<
    string | null
  >(null);
  const [tempMarker, setTempMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterZoneId, setFilterZoneId] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pointsData, zonesData] = await Promise.all([
        logisticsService.getMeetingPoints(),
        logisticsService.getZones(),
      ]);
      setPoints(pointsData);
      setZones(zonesData);
    } catch (err: any) {
      setError(err.message || "Error al cargar puntos de encuentro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      const matchesSearch =
        !searchQuery ||
        point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (point.contactPhone && point.contactPhone.includes(searchQuery));
      const matchesZone = filterZoneId === "all" || point.zoneId === filterZoneId;
      return matchesSearch && matchesZone;
    });
  }, [points, searchQuery, filterZoneId]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingPoint(null);
  };

  const handleOpenDialog = (point?: MeetingPoint) => {
    if (point) {
      setEditingPoint(point);
      setFormData({
        zoneId: point.zoneId,
        name: point.name,
        address: point.address,
        latitude: point.latitude.toString(),
        longitude: point.longitude.toString(),
        description: point.description || "",
        reference: point.reference || "",
        contactPhone: point.contactPhone || "",
        openingHours: point.openingHours || "",
        capacity: point.capacity?.toString() || "",
        priority: point.priority.toString(),
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);

    // Cuando abrimos el diálogo para crear/editar, mostrar el marcador en el mapa
    if (point) {
      setTempMarker({ lat: point.latitude, lng: point.longitude });
      setSelectedPointId(point.id);
      setSelectedZoneIdForMap(point.zoneId);
    } else {
      setTempMarker(null);
      setSelectedPointId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        zoneId: formData.zoneId,
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        description: formData.description || undefined,
        reference: formData.reference || undefined,
        contactPhone: formData.contactPhone || undefined,
        openingHours: formData.openingHours || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        priority: parseInt(formData.priority) || 0,
      };

      if (editingPoint) {
        await logisticsService.updateMeetingPoint(editingPoint.id, payload);
        toast.success("Punto de encuentro actualizado correctamente");
      } else {
        await logisticsService.createMeetingPoint(payload as CreateMeetingPointDto);
        toast.success("Punto de encuentro creado correctamente");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar punto de encuentro");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await logisticsService.deleteMeetingPoint(id);
      toast.success("Punto de encuentro eliminado");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar punto de encuentro");
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await logisticsService.toggleMeetingPointAvailability(id);
      toast.success("Disponibilidad actualizada");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar disponibilidad");
    }
  };

  const getZoneName = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone?.name || zoneId;
  };
  const handleMapClick = (lat: number, lng: number) => {
    setTempMarker({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const handleMapMarkerClick = (point: MeetingPoint) => {
    setSelectedPointId(point.id);
    setSelectedZoneIdForMap(point.zoneId);
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (error) return <div className="p-8 text-destructive">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold">Puntos de Encuentro</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Punto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, dirección o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-64">
          <Select value={filterZoneId} onValueChange={setFilterZoneId}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las zonas</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: mapa */}
        <div className="bg-card rounded-lg shadow-sm border p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#1559ED]" />
              Mapa de puntos de encuentro
            </h2>
            <span className="text-xs text-muted-foreground">
              Haz clic en el mapa para elegir coordenadas
            </span>
          </div>
          <div className="w-full h-105">
            <MeetingPointMap
              meetingPoints={points}
              selectedPointId={selectedPointId}
              onMapClick={handleMapClick}
              onMarkerClick={handleMapMarkerClick}
              tempMarker={tempMarker || undefined}
              selectedZone={
                selectedZoneIdForMap
                  ? zones.find((z) => z.id === selectedZoneIdForMap) || null
                  : null
              }
              allZones={zones}
            />
          </div>
        </div>

        {/* Columna derecha: lista / tabla usando el componente reutilizable */}
        <div className="space-y-4">
          <div className="bg-card shadow-sm rounded-lg overflow-hidden border">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Disponible
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredPoints.map((point) => (
                  <tr
                    key={point.id}
                    className={`hover:bg-muted/50 ${
                      selectedPointId === point.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedPointId(point.id);
                      setSelectedZoneIdForMap(point.zoneId);
                      setTempMarker({
                        lat: point.latitude,
                        lng: point.longitude,
                      });
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {point.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {point.zone?.name || getZoneName(point.zoneId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                      {point.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {point.contactPhone || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleToggleAvailability(point.id);
                        }}
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          point.isAvailable
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {point.isAvailable ? "Sí" : "No"}
                      </Button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(point);
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
                                permanentemente el punto de encuentro
                                &quot;{point.name}&quot;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(point.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPoints.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      {points.length === 0
                        ? "No hay puntos de encuentro configurados"
                        : "No se encontraron resultados para los filtros aplicados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Lista resumida reutilizando el componente antiguo para una vista más compacta */}
          <MeetingPointsList
            meetingPoints={points}
            selectedPointId={selectedPointId}
            onPointSelect={(p) => {
              setSelectedPointId(p.id);
              setSelectedZoneIdForMap(p.zoneId);
              setTempMarker({ lat: p.latitude, lng: p.longitude });
            }}
            onPointDelete={handleDelete}
            onPointEdit={(p) => handleOpenDialog(p)}
            filteredZoneId={filterZoneId === "all" ? null : filterZoneId}
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPoint ? "Editar Punto de Encuentro" : "Nuevo Punto de Encuentro"}
            </DialogTitle>
            <DialogDescription>
              Ingresa los detalles del punto de encuentro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="zoneId">Zona</Label>
                <Select
                  value={formData.zoneId}
                  onValueChange={(value) => setFormData({ ...formData, zoneId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mp-name">Nombre</Label>
                <Input
                  id="mp-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mp-address">Dirección</Label>
                <Input
                  id="mp-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mp-description">Descripción</Label>
                <Textarea
                  id="mp-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Ej: Frente al parque central"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingHours">Horario</Label>
                  <Input
                    id="openingHours"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="Lun-Vie 8:00-18:00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                </div>
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
