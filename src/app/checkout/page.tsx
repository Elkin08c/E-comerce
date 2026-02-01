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
import { Loader2, Truck, CreditCard, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, cartId } = useCartStore();
  
  const { data: addrData, loading: addrLoading } = useQuery<any>(GET_CUSTOMER_ADDRESSES);
  const { data: shipData, loading: shipLoading } = useQuery<any>(GET_SHIPPING_METHODS);
  const { data: zoneData, loading: zoneLoading } = useQuery<any>(GET_SHIPPING_ZONES);
  
  const [checkout, { loading: processing }] = useMutation(CHECKOUT);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("CASH_ON_DELIVERY");
  const [selectedZone, setSelectedZone] = useState("");

  const addresses = addrData?.customersAddresses?.edges?.map((e: any) => e.node) || [];
  const shippingMethods = shipData?.shippingMethods || [];
  const zones = zoneData?.shippingZones || [];

  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedShipping || !selectedZone) {
      toast.error("Por favor selecciona dirección, zona y método de envío");
      return;
    }

    try {
      const { data }: any = await checkout({
        variables: {
          input: {
            cartId,
            addressId: selectedAddress,
            zoneId: selectedZone,
            shippingMethodId: selectedShipping, // Assuming selectedShipping is the name or ID
            shippingMethodType: "HOME_DELIVERY", // Defaulting for simple checkout
            paymentMethodType: selectedPayment,
            notes: "Pedido desde el frontend",
          },
        },
      });

      if (data?.checkout?.success) {
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

  if (addrLoading || shipLoading || zoneLoading) {
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

          {/* Método de Envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Método de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping} className="space-y-4">
                {shippingMethods.map((method: any) => (
                  <div key={method.name} className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={method.name} id={method.name} />
                    <Label htmlFor={method.name} className="cursor-pointer flex-1 flex justify-between">
                      <div>
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-sm text-muted-foreground">Estimado: {method.estimatedDays} días</div>
                      </div>
                      <div className="font-bold">${method.basePrice.toFixed(2)}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Método de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Método de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-4">
                <div className="flex items-center space-x-3 border p-4 rounded-lg bg-primary/5 border-primary">
                  <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" />
                  <Label htmlFor="cod" className="cursor-pointer font-medium">Pago contra entrega</Label>
                </div>
                {/* Agrega más métodos según tu backend */}
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
