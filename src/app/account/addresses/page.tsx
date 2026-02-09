"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CUSTOMER_ADDRESSES } from "@/graphql/queries";
import {
  CREATE_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_ADDRESS,
  REMOVE_CUSTOMER_ADDRESS,
} from "@/graphql/extended-queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MapPin, Plus, Pencil, Trash2, Locate } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useLocationStore } from "@/store/location";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AddressFormData {
  street: string;
  neighborhood: string;
  reference: string;
  zipCode: string;
  cityId: string;
  parishId: string;
  sectorId: string;
  zoneId: string;
  label: string;
  isDefault: boolean;
  isBillingAddress: boolean;
  isShippingAddress: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    street: "",
    neighborhood: "",
    reference: "",
    zipCode: "",
    cityId: "",
    parishId: "",
    sectorId: "",
    zoneId: "",
    label: "Casa",
    isDefault: false,
    isBillingAddress: false,
    isShippingAddress: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data, loading, refetch } = useQuery<any>(GET_CUSTOMER_ADDRESSES);
  const [createAddress, { loading: creating }] = useMutation(CREATE_CUSTOMER_ADDRESS);
  const [updateAddress, { loading: updating }] = useMutation(UPDATE_CUSTOMER_ADDRESS);
  const [removeAddress, { loading: deleting }] = useMutation(REMOVE_CUSTOMER_ADDRESS);

  const addresses = data?.customersAddresses?.edges?.map((e: any) => e.node) || [];

  const handleOpenDialog = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        street: address.street || "",
        neighborhood: address.neighborhood || "",
        reference: address.reference || "",
        zipCode: address.zipCode || "",
        cityId: address.cityId || "",
        parishId: address.parishId || "",
        sectorId: address.sectorId || "",
        zoneId: address.zoneId || "",
        label: address.label || "Casa",
        isDefault: address.isDefault || false,
        isBillingAddress: address.isBillingAddress || false,
        isShippingAddress: address.isShippingAddress || true,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        street: "",
        neighborhood: "",
        reference: "",
        zipCode: "",
        cityId: "",
        parishId: "",
        sectorId: "",
        zoneId: "",
        label: "Casa",
        isDefault: false,
        isBillingAddress: false,
        isShippingAddress: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await updateAddress({
          variables: {
            id: editingAddress.id,
            data: formData,
          },
        });
        toast.success("Dirección actualizada correctamente");
      } else {
        await createAddress({
          variables: {
            createCustomersAddressInput: formData,
          },
        });
        toast.success("Dirección creada correctamente");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la dirección");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;

    try {
      await removeAddress({ variables: { id } });
      toast.success("Dirección eliminada correctamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la dirección");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mis Direcciones</h1>
              <p className="text-muted-foreground">Gestiona tus direcciones de envío y facturación</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Dirección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Editar Dirección" : "Nueva Dirección"}</DialogTitle>
                <DialogDescription>
                  {editingAddress ? "Actualiza los datos de tu dirección" : "Agrega una nueva dirección de envío"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="label">Etiqueta</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Ej: Casa, Oficina, etc."
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="street">Calle / Dirección</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Calle principal, número, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Barrio</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Nombre del barrio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="010101"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="reference">Referencia</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Puntos de referencia cercanos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cityId">Ciudad ID</Label>
                    <Input
                      id="cityId"
                      value={formData.cityId}
                      onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                      placeholder="ID de la ciudad"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zoneId">Zona de envío</Label>
                    <ZoneDetectField
                      value={formData.zoneId}
                      onChange={(zoneId) => setFormData({ ...formData, zoneId })}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">Dirección predeterminada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isShippingAddress"
                      checked={formData.isShippingAddress}
                      onCheckedChange={(checked) => setFormData({ ...formData, isShippingAddress: checked as boolean })}
                    />
                    <Label htmlFor="isShippingAddress" className="cursor-pointer">Usar para envíos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBillingAddress"
                      checked={formData.isBillingAddress}
                      onCheckedChange={(checked) => setFormData({ ...formData, isBillingAddress: checked as boolean })}
                    />
                    <Label htmlFor="isBillingAddress" className="cursor-pointer">Usar para facturación</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={creating || updating}>
                    {(creating || updating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingAddress ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-secondary/30 p-4 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No tienes direcciones guardadas</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Agrega una dirección para facilitar tus compras futuras
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Dirección
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address: any) => (
              <Card key={address.id} className={address.isDefault ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {address.label}
                        {address.isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Predeterminada
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="flex gap-2 mt-1">
                        {address.isShippingAddress && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Envío</span>
                        )}
                        {address.isBillingAddress && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Facturación</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(address)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(address.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{address.street}</p>
                    {address.neighborhood && <p className="text-muted-foreground">{address.neighborhood}</p>}
                    {address.reference && <p className="text-muted-foreground italic">Ref: {address.reference}</p>}
                    {address.zipCode && <p className="text-muted-foreground">CP: {address.zipCode}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ZoneDetectField({
  value,
  onChange,
}: {
  value: string;
  onChange: (zoneId: string) => void;
}) {
  const { primaryZone, status, detectLocation } = useLocationStore();

  useEffect(() => {
    if (primaryZone && !value) {
      onChange(primaryZone.id);
    }
  }, [primaryZone, value, onChange]);

  const handleDetect = () => {
    detectLocation();
  };

  const isLoading = status === "requesting" || status === "loading";
  const zoneName = primaryZone && value === primaryZone.id ? primaryZone.name : null;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id="zoneId"
          value={zoneName || value}
          readOnly={!!zoneName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Usa el botón para detectar tu zona"
          className="flex-1"
          required
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDetect}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
        </Button>
      </div>
      {zoneName && (
        <p className="text-sm text-green-600">
          Zona detectada: {zoneName}
        </p>
      )}
      {status === "resolved" && !primaryZone && (
        <p className="text-sm text-muted-foreground">
          Fuera de cobertura. Ingresa el ID manualmente.
        </p>
      )}
      {(status === "denied" || status === "error" || status === "unavailable") && (
        <p className="text-sm text-destructive">
          No se pudo detectar la zona. Ingresa el ID manualmente.
        </p>
      )}
    </div>
  );
}
