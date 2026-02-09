"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import { Suspense } from "react";

export default function OrderConfirmationPageWrapper() {
  return (
    <Suspense fallback={<div className='flex justify-center items-center min-h-screen'>Cargando...</div>}>
      <OrderConfirmationPage />
    </Suspense>
  );
}

function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Efecto de confetti al cargar la página
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    setLoading(false);

    return () => clearInterval(interval);
  }, []);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center py-16">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">No se encontró la orden</h2>
                <p className="text-muted-foreground">
                  No se pudo encontrar el ID de la orden
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/">
                  Volver al Inicio
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl md:text-4xl font-bold">
                ¡Pedido Confirmado!
              </CardTitle>
              <CardDescription className="text-lg">
                Tu orden ha sido procesada exitosamente
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Order ID */}
            <div className="bg-secondary/30 rounded-lg p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Número de Orden
              </p>
              <p className="text-2xl font-bold font-mono tracking-tight">
                #{orderId.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                Guarda este número para hacer seguimiento de tu pedido
              </p>
            </div>

            {/* What's Next */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">¿Qué sigue?</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-secondary/10 rounded-lg">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Confirmación enviada</p>
                    <p className="text-sm text-muted-foreground">
                      Recibirás un email con los detalles de tu pedido
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-secondary/10 rounded-lg">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Preparación del pedido</p>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo comenzará a preparar tu pedido
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-secondary/10 rounded-lg">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Entrega</p>
                    <p className="text-sm text-muted-foreground">
                      Recibirás tu pedido en la dirección indicada
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Nota:</strong> Puedes hacer seguimiento de tu pedido en cualquier momento 
                desde la sección "Mis Pedidos" en tu cuenta.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button asChild className="flex-1" size="lg">
              <Link href="/account/orders">
                Ver Mis Pedidos
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/catalog">
                Seguir Comprando
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Thank You Message */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-2xl font-bold">¡Gracias por tu compra!</p>
          <p className="text-muted-foreground">
            Apreciamos tu confianza en nosotros
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
