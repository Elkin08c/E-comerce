"use client";
import { useQuery } from "@apollo/client/react";
import { GET_CUSTOMER } from "@/graphql/queries";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, User, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useAuthStore } from "@/store/auth";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [router, isAuthenticated]);

  const customerId = user?.id;

  const { data, loading, error } = useQuery<any>(GET_CUSTOMER, {
    variables: { id: customerId || "" },
    skip: !customerId,
  });

  if (!customerId || loading) {
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

  if (error) {
     return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
         <div className="flex-1 flex flex-col justify-center items-center gap-4 p-4 text-center">
            <h2 className="text-xl font-bold text-destructive">Error al cargar perfil</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
         </div>
        <Footer />
      </div>
    );
  }

  const customer = data?.customer;

  if (!customer) {
      return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 flex justify-center items-center">
                <p>No se encontró información del cliente.</p>
            </div>
            <Footer />
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
             <div className="bg-primary/10 p-4 rounded-full">
                <User className="h-8 w-8 text-primary" />
             </div>
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground">Gestiona tu información personal</p>
             </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" /> Información Personal
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                        <p className="text-lg">{customer.firstName} {customer.lastName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                             <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                             <p>{customer.email}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                             <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                             <p>{customer.phone || "No registrado"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Address Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Dirección de Envío Princ.
                    </CardTitle>
                     <CardDescription>Esta dirección se usará por defecto.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {customer.shippingAddress ? (
                        <>
                            <p className="text-lg">{customer.shippingAddress}</p>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Ciudad:</span> {customer.shippingCity}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Estado:</span> {customer.shippingState}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">CP:</span> {customer.shippingZipCode}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">País:</span> {customer.shippingCountry}
                                </div>
                             </div>
                        </>
                    ) : (
                        <p className="text-muted-foreground italic">No hay dirección configurada.</p>
                    )}
                </CardContent>
            </Card>
            
            {/* Billing Info */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" /> Dirección de Facturación
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {customer.billingAddress ? (
                        <>
                            <p className="text-lg">{customer.billingAddress}</p>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Ciudad:</span> {customer.billingCity}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Estado:</span> {customer.billingState}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-muted-foreground italic">Igual a dirección de envío o no configurada.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
