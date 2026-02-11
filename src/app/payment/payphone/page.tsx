"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

export default function PayPhonePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Cargando...
        </div>
      }
    >
      <PayPhonePage />
    </Suspense>
  );
}

function PayPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const token = searchParams.get("token");
  const storeId = searchParams.get("storeId");
  const amount = searchParams.get("amount");
  const clientTxId = searchParams.get("clientTxId");

  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingParams = !token || !storeId || !amount || !clientTxId;

  // Inicializar el botón de PayPhone cuando el SDK esté listo
  useEffect(() => {
    if (!sdkReady || missingParams) return;

    try {
      const ppb = (window as any).payphone;
      if (!ppb) {
        setError("No se pudo cargar el SDK de PayPhone");
        return;
      }

      ppb.Button({
        token,
        amount: Number(amount),
        amountWithoutTax: Number(amount),
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        currency: "USD",
        storeId,
        reference: clientTxId,
        clientTransactionId: clientTxId,
        responseUrl: `${window.location.origin}/api/webhooks/payphone?orderId=${orderId}&paymentId=${paymentId}`,
        cancellationUrl: `${window.location.origin}/order-confirmation?orderId=${orderId}&paymentStatus=cancelled`,
      }).render("#pp-button");
    } catch (err: any) {
      console.error("PayPhone init error:", err);
      setError("Error al inicializar PayPhone: " + err.message);
    }
  }, [sdkReady, token, storeId, amount, clientTxId, orderId, paymentId, missingParams]);

  if (missingParams) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center py-16">
            <CardContent className="space-y-6">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold">Parámetros de pago inválidos</h2>
              <p className="text-muted-foreground">
                No se recibieron los datos necesarios para procesar el pago.
              </p>
              <Button onClick={() => router.push("/")}>Volver al Inicio</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <Script
        src="https://pay.payphonetodoesposible.com/api/button/js?appId=btn_pp"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => setError("No se pudo cargar el script de PayPhone")}
      />

      <main className="flex-1 container mx-auto px-4 py-16 max-w-lg">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <CreditCard className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Pagar con PayPhone</CardTitle>
            <p className="text-muted-foreground">
              Completa el pago de forma segura con PayPhone
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Resumen del monto */}
            <div className="bg-secondary/30 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Total a pagar</p>
              <p className="text-3xl font-bold">
                ${(Number(amount) / 100).toFixed(2)}
              </p>
            </div>

            {error ? (
              <div className="flex flex-col items-center gap-4 p-6">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm text-destructive text-center">{error}</p>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Volver al Inicio
                </Button>
              </div>
            ) : !sdkReady ? (
              <div className="flex flex-col items-center gap-4 p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Cargando pasarela de pago...
                </p>
              </div>
            ) : (
              <div id="pp-button" className="flex justify-center min-h-[60px]" />
            )}

            <p className="text-xs text-muted-foreground text-center">
              Tu pago será procesado de forma segura por PayPhone.
              No almacenamos los datos de tu tarjeta.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
