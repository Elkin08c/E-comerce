"use client";

import { useEffect, useState } from "react";
import {
    locationService,
    type Province,
    type City
} from "@/lib/services/location.service";
import {
    Building2,
    Globe,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    ChevronRight,
    MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LocationsPage() {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("provinces");

    // Province State
    const [isProvinceDialogOpen, setIsProvinceDialogOpen] = useState(false);
    const [editingProvince, setEditingProvince] = useState<Province | null>(null);
    const [provinceForm, setProvinceForm] = useState({ name: "", code: "" });

    // City State
    const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [cityForm, setCityForm] = useState({ name: "", provinceId: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await locationService.getProvinces();
            setProvinces(data);
        } catch (err: any) {
            toast.error("Error al cargar localizaciones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Province Handlers ---
    const handleOpenProvinceDialog = (province?: Province) => {
        if (province) {
            setEditingProvince(province);
            setProvinceForm({ name: province.name, code: province.code || "" });
        } else {
            setEditingProvince(null);
            setProvinceForm({ name: "", code: "" });
        }
        setIsProvinceDialogOpen(true);
    };

    const handleSaveProvince = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProvince) {
                await locationService.updateProvince(editingProvince.id, provinceForm.name, provinceForm.code);
                toast.success("Provincia actualizada");
            } else {
                await locationService.createProvince(provinceForm.name, provinceForm.code);
                toast.success("Provincia creada");
            }
            setIsProvinceDialogOpen(false);
            fetchData();
        } catch (err: any) {
            toast.error("Error al guardar provincia");
        }
    };

    const handleDeleteProvince = async (id: string) => {
        try {
            await locationService.deleteProvince(id);
            toast.success("Provincia eliminada");
            fetchData();
        } catch (err: any) {
            toast.error("Error al eliminar provincia. Asegúrate de que no tenga ciudades asociadas.");
        }
    };

    // --- City Handlers ---
    const handleOpenCityDialog = (city?: City) => {
        if (city) {
            setEditingCity(city);
            setCityForm({ name: city.name, provinceId: city.provinceId });
        } else {
            setEditingCity(null);
            setCityForm({ name: "", provinceId: provinces[0]?.id || "" });
        }
        setIsCityDialogOpen(true);
    };

    const handleSaveCity = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCity) {
                await locationService.updateCity(editingCity.id, cityForm.name, cityForm.provinceId);
                toast.success("Ciudad actualizada");
            } else {
                await locationService.createCity(cityForm.name, cityForm.provinceId);
                toast.success("Ciudad creada");
            }
            setIsCityDialogOpen(false);
            fetchData();
        } catch (err: any) {
            toast.error("Error al guardar ciudad");
        }
    };

    const handleDeleteCity = async (id: string) => {
        try {
            await locationService.deleteCity(id);
            toast.success("Ciudad eliminada");
            fetchData();
        } catch (err: any) {
            toast.error("Error al eliminar ciudad");
        }
    };

    if (loading && provinces.length === 0) {
        return (
            <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 container mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="h-6 w-6 text-blue-600" />
                        Localizaciones
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gestiona las provincias y ciudades para las zonas de entrega.
                    </p>
                </div>
                <div className="flex gap-2">
                    {activeTab === "provinces" ? (
                        <Button onClick={() => handleOpenProvinceDialog()} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" /> Nueva Provincia
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleOpenCityDialog()}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={provinces.length === 0}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Nueva Ciudad
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                    <TabsTrigger value="provinces" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Provincias
                    </TabsTrigger>
                    <TabsTrigger value="cities" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Ciudades
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="provinces" className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provincia</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ciudades</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {provinces.map((province) => (
                                    <tr key={province.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{province.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{province.code || "—"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{province.cities?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenProvinceDialog(province)} className="text-blue-600 hover:bg-blue-50">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar provincia?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción eliminará la provincia "{province.name}". No podrá deshacerse.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteProvince(province.id)} className="bg-red-600">Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="cities" className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ciudad</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provincia</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {provinces.flatMap(p => (p.cities || []).map(city => ({ ...city, provinceName: p.name }))).map((city) => (
                                    <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{city.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {city.provinceName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenCityDialog(city)} className="text-blue-600 hover:bg-blue-50">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Eliminar ciudad?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción eliminará la ciudad "{city.name}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteCity(city.id)} className="bg-red-600">Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- Province Dialog --- */}
            <Dialog open={isProvinceDialogOpen} onOpenChange={setIsProvinceDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSaveProvince}>
                        <DialogHeader>
                            <DialogTitle>{editingProvince ? "Editar Provincia" : "Nueva Provincia"}</DialogTitle>
                            <DialogDescription>Ingresa los detalles de la provincia.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="prov-name">Nombre</Label>
                                <Input id="prov-name" value={provinceForm.name} onChange={e => setProvinceForm({ ...provinceForm, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prov-code">Código (opcional)</Label>
                                <Input id="prov-code" value={provinceForm.code} onChange={e => setProvinceForm({ ...provinceForm, code: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsProvinceDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- City Dialog --- */}
            <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSaveCity}>
                        <DialogHeader>
                            <DialogTitle>{editingCity ? "Editar Ciudad" : "Nueva Ciudad"}</DialogTitle>
                            <DialogDescription>Ingresa los detalles de la ciudad y asígnala a una provincia.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="city-name">Nombre</Label>
                                <Input id="city-name" value={cityForm.name} onChange={e => setCityForm({ ...cityForm, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city-prov">Provincia</Label>
                                <select
                                    id="city-prov"
                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={cityForm.provinceId}
                                    onChange={e => setCityForm({ ...cityForm, provinceId: e.target.value })}
                                    required
                                >
                                    {provinces.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCityDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
