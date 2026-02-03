"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CUSTOMER_ADDRESSES, GET_SHIPPING_METHODS, GET_SHIPPING_ZONES } from "@/graphql/queries";
import { CHECKOUT } from "@/graphql/mutations";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, Truck, CreditCard, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { logisticsService } from "@/lib/services/logistics.service";
import { paymentProvidersService } from "@/lib/services/payment-providers.service";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, cartId } = useCartStore();
  
  const { data: addrData, loading: addrLoading } = useQuery<any>(GET_CUSTOMER_ADDRESSES);
  const [checkout, { loading: processing }] = useMutation(CHECKOUT);

  // Estados para nuevos servicios REST
  const [zones, setZones] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [meetingPoints, setMeetingPoints] = useState<any[]>([]);
  const [loadingLogistics, setLoadingLogistics] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState("");

  const addresses = addrData?.customersAddresses?.edges?.map((e: any) => e.node) || [];
  const currentZone = zones.find(z => z.id === selectedZone);
  const currentShipping = shippingMethods.find(s => s.id === selectedShipping);

  // Cargar zonas al montar el componente
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesData = await logisticsService.getZones();
        setZones(zonesData);
      } catch (err: any) {
        toast.error("Error al cargar zonas de entrega");
      } finally {
        setLoadingLogistics(false);
      }
    };
    fetchZones();
  }, []);

  // Cargar métodos cuando cambia la zona
  useEffect(() => {
    if (selectedZone) {
      const fetchMethods = async () => {
        try {
          const [shipData, payData] = await Promise.all([
            logisticsService.getShippingMethods(selectedZone),
            logisticsService.getPaymentMethods(selectedZone),
          ]);
          setShippingMethods(shipData);
          setPaymentMethods(payData);
          
          // Reset selections
          setSelectedShipping("");
          setSelectedPayment("");
          setSelectedMeetingPoint("");

          // Load meeting points if zone is DANGER
          const zone = zones.find(z => z.id === selectedZone);
          if (zone?.type === "DANGER") {
            const mpData = await logisticsService.getAvailableMeetingPointsByZone(selectedZone);
            setMeetingPoints(mpData);
          } else {
            setMeetingPoints([]);
          }
        } catch (err: any) {
          toast.error("Error al cargar métodos para esta zona");
        }
      };
      fetchMethods();
    } else {
      setShippingMethods([]);
      setPaymentMethods([]);
      setMeetingPoints([]);
    }
  }, [selectedZone, zones]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedShipping || !selectedZone || !selectedPayment) {
      toast.error("Por favor completa todos los pasos de selección");
      return;
    }

    if (currentZone?.type === "DANGER" && !selectedMeetingPoint) {
      toast.error("Las zonas de peligro requieren seleccionar un punto de encuentro");
      return;
    }

    try {
      const { data }: any = await checkout({
        variables: {
          input: {
            cartId,
            addressId: selectedAddress,
            zoneId: selectedZone,
            shippingMethodId: selectedShipping,
            shippingMethodType: currentShipping?.type || "HOME_DELIVERY",
            paymentMethodType: selectedPayment,
            meetingPointId: selectedMeetingPoint || undefined,
            notes: "Pedido desde el frontend",
          },
        },
      });

      if (data?.checkout?.success) {
        const { orderId } = data.checkout;

        // Lógica para proveedores externos
        if (selectedPayment === "PAYPHONE") {
           const init = await paymentProvidersService.initializePayphone({
             orderId,
             amount: subtotal(),
             tax: 0
           });
           window.location.href = init.responseUrl;
           return;
        }

        if (selectedPayment === "DEUNA") {
           const init = await paymentProvidersService.initializeDeuna({
             orderId,
             amount: subtotal()
           });
           window.location.href = init.checkoutUrl;
           return;
        }

        toast.success("¡Pedido realizado con éxito!");
        await clearCart();
        router.push(`/account/orders`);
      } else {
        toast.error(data?.checkout?.message || "Error al procesar el pedido");
      }
    } catch (err: any) {
      toast.error(err.message || "Error inesperado");
    }
  };

  if (addrLoading || loadingLogistics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Direcciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-4">
                {addresses.map((addr: any) => (
                  <div key={addr.id} className="flex items-start space-x-3 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                    <Label htmlFor={addr.id} className="cursor-pointer font-normal flex-1">
                      <div className="font-semibold">{addr.street}</div>
                      <div className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</div>
                      <div className="text-sm text-muted-foreground">{addr.country}</div>
                    </Label>
                  </div>
                ))}
                {addresses.length === 0 && (
                   <p className="text-muted-foreground text-sm">No tienes direcciones guardadas. Agrega una en tu perfil.</p>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Zona de Envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Zona de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
               <RadioGroup value={selectedZone} onValueChange={setSelectedZone} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {zones.map((zone: any) => (
                  <div key={zone.id} className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={zone.id} id={zone.id} />
                    <Label htmlFor={zone.id} className="cursor-pointer font-medium">{zone.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Puntos de Encuentro (Solo para zonas DANGER) */}
          {currentZone?.type === "DANGER" && (
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <MapPin className="h-5 w-5" /> Punto de Encuentro Requerido
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Debido a la ubicación, la entrega se realizará en un punto seguro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMeetingPoint} onValueChange={setSelectedMeetingPoint} className="space-y-4">
                  {meetingPoints.map((mp: any) => (
                    <div key={mp.id} className="flex items-start space-x-3 border border-amber-200 bg-white p-4 rounded-lg hover:bg-amber-50 transition-colors">
                      <RadioGroupItem value={mp.id} id={mp.id} className="mt-1" />
                      <Label htmlFor={mp.id} className="cursor-pointer font-normal flex-1">
                        <div className="font-semibold">{mp.name}</div>
                        <div className="text-sm text-muted-foreground">{mp.address}</div>
                      </Label>
                    </div>
                  ))}
                  {meetingPoints.length === 0 && (
                    <p className="text-amber-800 text-sm font-medium">Cargando puntos de encuentro...</p>
                  )}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Método de Envío */}
          <Card className={!selectedZone ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Método de Envío
              </CardTitle>
              {!selectedZone && <CardDescription>Selecciona una zona primero</CardDescription>}
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping} className="space-y-4">
                {shippingMethods.map((method: any) => (
                  <div key={method.id} className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="cursor-pointer flex-1 flex justify-between">
                      <div>
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                      <div className="font-bold">${method.baseCost.toFixed(2)}</div>
                    </Label>
                  </div>
                ))}
                {selectedZone && shippingMethods.length === 0 && (
                  <div className="flex items-center gap-2 p-4 text-amber-600 bg-amber-50 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">No hay métodos de envío disponibles para esta zona.</span>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Método de Pago */}
          <Card className={!selectedZone ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Método de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method: any) => (
                  <div key={method.type} className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={method.type} id={method.type} />
                    <Label htmlFor={method.type} className="cursor-pointer font-medium">{method.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de Pedido */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Envío</span>
                <span>Calculado al procesar</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${subtotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handlePlaceOrder}
                disabled={processing || items.length === 0}
              >
                {processing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                Confirmar Pedido
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
