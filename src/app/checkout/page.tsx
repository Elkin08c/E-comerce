"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CUSTOMER_ADDRESSES } from "@/graphql/queries";
import { CHECKOUT } from "@/graphql/mutations";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, Truck, CreditCard, MapPin, CheckCircle2, AlertCircle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { logisticsService } from "@/lib/services/logistics.service";
import { paymentProvidersService } from "@/lib/services/payment-providers.service";
import { cartService } from "@/lib/services/cart.service";
import { useLocationStore } from "@/store/location";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, cartId, fetchCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { primaryZone: detectedZone, status: locationStatus, detectLocation } = useLocationStore();

  // Verificar autenticación al cargar la página
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para continuar con la compra");
      // Guardar la ruta actual para redirigir después del login
      sessionStorage.setItem("redirectAfterLogin", "/checkout");
      router.push("/login");
      return;
    }

    // Si está autenticado, sincronizar carrito con el servidor
    if (!cartId) {
      fetchCart();
    }
  }, [isAuthenticated, router, cartId, fetchCart]);

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
  const [orderPlaced, setOrderPlaced] = useState(false);

  const addresses = addrData?.customersAddresses?.edges?.map((e: any) => e.node) || [];
  const currentZone = zones.find(z => z.id === selectedZone);

  // Shipping cost comes from the zone's flat rate, not the shipping method object
  const shippingCost = currentZone?.shippingPrice || 0;

  // Auto-seleccionar dirección por defecto cuando cargan
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a: any) => a.isDefault);
      setSelectedAddress(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses, selectedAddress]);

  // Cargar zonas al montar el componente
  useEffect(() => {
    if (!isAuthenticated) return; // No cargar si no está autenticado

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
  }, [isAuthenticated]);

  // Cargar métodos cuando cambia la zona
  useEffect(() => {
    if (selectedZone) {
      const fetchMethods = async () => {
        try {
          const [shipData, payData] = await Promise.all([
            logisticsService.getShippingMethods(selectedZone),
            logisticsService.getPaymentMethods(selectedZone),
          ]);

          // Filter to only HOME_DELIVERY methods
          const homeDelivery = shipData.filter((item: any) => item.type === "HOME_DELIVERY");

          // Deduplicate payment methods by type (used as key in render)
          const uniquePayment = Array.from(
            new Map(payData.map((item: any) => [String(item.type), item])).values()
          );

          setShippingMethods(homeDelivery);
          setPaymentMethods(uniquePayment);

          // Auto-select HOME_DELIVERY since it's the only option
          if (homeDelivery.length > 0) {
            setSelectedShipping(homeDelivery[0].id || homeDelivery[0].type);
          } else {
            setSelectedShipping("");
          }
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

  // Auto-seleccionar zona detectada por geolocalización
  useEffect(() => {
    if (detectedZone && zones.length > 0 && !selectedZone) {
      if (zones.find((z: any) => z.id === detectedZone.id)) {
        setSelectedZone(detectedZone.id);
      }
    }
  }, [detectedZone, zones, selectedZone]);

  useEffect(() => {
    if (items.length === 0 && isAuthenticated && !orderPlaced) {
      router.push("/");
    }
  }, [items, router, isAuthenticated, orderPlaced]);

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
      // Validar stock antes de proceder
      if (cartId) {
        try {
          const stockValidation = await cartService.validateStock(cartId);
          if (!stockValidation.isValid) {
            toast.error("Algunos productos ya no tienen stock suficiente", {
              description: "Por favor revisa tu carrito y actualiza las cantidades."
            });
            return;
          }
        } catch (stockErr) {
          console.error("Error validating stock:", stockErr);
          toast.warning("No se pudo validar el stock. Continuando con precaución...");
        }
      }

      const currentShipping = shippingMethods.find(s => (s.id || s.type) === selectedShipping);

      const { data }: any = await checkout({
        variables: {
          input: {
            cartId,
            addressId: selectedAddress,
            zoneId: selectedZone,
            shippingMethodType: currentShipping?.type || "HOME_DELIVERY",
            paymentMethodType: selectedPayment,
            notes: "Pedido desde el frontend",
          },
        },
      });

      if (data?.checkout?.success) {
        const { orderId } = data.checkout;

        // Lógica para proveedores externos (CREDIT_CARD usa PayPhone como pasarela)
        if (selectedPayment === "PAYPHONE" || selectedPayment === "CREDIT_CARD") {
          const init = await paymentProvidersService.initializePayphone({
            orderId,
          });

          setOrderPlaced(true);
          await clearCart();
          router.push(
            `/payment/payphone?orderId=${orderId}&paymentId=${data.checkout.paymentId}` +
            `&token=${init.token}&storeId=${init.storeId}` +
            `&amount=${init.amount}&clientTxId=${init.clientTransactionId}`
          );
          return;
        }

        if (selectedPayment === "DEUNA") {
          const init = await paymentProvidersService.initializeDeuna({
            orderId,
            format: "2" // QR + Deeplink
          });

          if (init.deeplink) {
            window.location.href = init.deeplink;
          } else {
            toast.info("Solicitud de Deuna creada, finaliza el pago en tu app.");
            router.push(`/order-confirmation?orderId=${orderId}`);
          }
          return;
        }

        // Transferencia bancaria: redirigir con flag para mostrar instrucciones
        if (selectedPayment === "BANK_TRANSFER") {
          setOrderPlaced(true);
          await clearCart();
          router.push(
            `/order-confirmation?orderId=${orderId}&paymentId=${data.checkout.paymentId}&bankTransfer=true`
          );
          return;
        }

        // Para otros métodos de pago (CASH_ON_DELIVERY, etc.)
        setOrderPlaced(true);
        await clearCart();
        router.push(`/order-confirmation?orderId=${orderId}`);
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
          {/* Dirección de Envío */}
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
                      <div className="font-semibold">{addr.recipientName}</div>
                      <div className="text-sm text-muted-foreground">{addr.street}</div>
                      <div className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode || ''}</div>
                    </Label>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <p className="text-muted-foreground text-sm">No tienes direcciones guardadas. Agrega una en tu perfil.</p>
                )}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Método de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shippingMethods.length > 0 ? (
                <div className="flex items-center space-x-3 border p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1 flex justify-between">
                    <div>
                      <div className="font-semibold">Envío a Domicilio</div>
                    </div>
                    <div className="font-bold">${Number(shippingCost).toFixed(2)}</div>
                  </div>
                </div>
              ) : selectedZone ? (
                <div className="flex items-center gap-2 p-4 text-amber-600 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">No hay métodos de envío disponibles para esta zona.</span>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Detectando zona de envío...</p>
              )}
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
                {paymentMethods.map((method: any, index: number) => (
                  <div key={`${method.type}-${index}`} className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
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
                  <div key={item.id} className="flex gap-4 text-sm">
                    <div className="w-12 h-12 bg-secondary/20 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingCart className="h-6 w-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-muted-foreground">{item.quantity} x ${Number(item.price).toFixed(2)}</div>
                    </div>
                    <div className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${Number(subtotal()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Envío</span>
                <span>${Number(shippingCost).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${(Number(subtotal()) + Number(shippingCost)).toFixed(2)}</span>
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
