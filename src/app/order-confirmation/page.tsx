"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, Home, Loader2, Upload, AlertCircle, Banknote, ImageIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import { Suspense } from "react";
import { paymentProvidersService } from "@/lib/services/payment-providers.service";
import { toast } from "sonner";

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
  const paymentId = searchParams.get("paymentId");
  const isBankTransfer = searchParams.get("bankTransfer") === "true";
  const [loading, setLoading] = useState(true);

  // Estado para upload de comprobante
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Efecto de confetti al cargar la página
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Solo se permiten imágenes o archivos PDF");
      return;
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no debe superar los 10MB");
      return;
    }

    setProofFile(file);

    // Preview para imágenes
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !paymentId) return;

    setUploading(true);
    try {
      await paymentProvidersService.uploadProof(paymentId, proofFile);
      setProofUploaded(true);
      toast.success("Comprobante enviado exitosamente");
    } catch (err: any) {
      toast.error(err.message || "Error al subir el comprobante");
    } finally {
      setUploading(false);
    }
  };

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
                {isBankTransfer ? "¡Pedido Registrado!" : "¡Pedido Confirmado!"}
              </CardTitle>
              <CardDescription className="text-lg">
                {isBankTransfer
                  ? "Tu orden está pendiente de pago por transferencia bancaria"
                  : "Tu orden ha sido procesada exitosamente"}
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

            {/* Bank Transfer Section */}
            {isBankTransfer && paymentId && (
              <div className="space-y-6">
                {/* Instrucciones bancarias */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      Instrucciones de Transferencia
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm text-amber-900 dark:text-amber-100">
                    <p>Realiza la transferencia bancaria con los siguientes datos:</p>
                    <div className="bg-white dark:bg-amber-950/40 rounded-lg p-4 space-y-2 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Banco:</span>
                        <span className="font-semibold">Banco del Pacífico</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo de cuenta:</span>
                        <span className="font-semibold">Corriente</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Número de cuenta:</span>
                        <span className="font-semibold">2205017804</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Titular:</span>
                        <span className="font-semibold">Esquivel Campoverde Jaime Renato</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RUC/CI:</span>
                        <span className="font-semibold">0102431582001</span>
                      </div>
                    </div>
                    <p className="text-xs">
                      <strong>Importante:</strong> Incluye tu número de orden{" "}
                      <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> en el
                      concepto de la transferencia.
                    </p>
                  </div>
                </div>

                {/* Upload de comprobante */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Upload className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">
                      {proofUploaded ? "Comprobante Enviado" : "Subir Comprobante de Pago"}
                    </h3>
                  </div>

                  {proofUploaded ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">
                          Comprobante enviado correctamente
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Nuestro equipo verificará tu pago y procesará tu pedido.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Sube una foto o captura de pantalla de tu comprobante de transferencia
                        para que podamos verificar tu pago.
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {proofFile ? (
                        <div className="space-y-4">
                          {proofPreview && (
                            <div className="relative mx-auto max-w-xs">
                              <img
                                src={proofPreview}
                                alt="Preview del comprobante"
                                className="w-full rounded-lg border shadow-sm"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm flex-1 truncate">{proofFile.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setProofFile(null);
                                setProofPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                            >
                              Cambiar
                            </Button>
                          </div>
                          <Button
                            className="w-full"
                            onClick={handleUploadProof}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Enviando comprobante...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Enviar Comprobante
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-20 border-dashed"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-6 w-6" />
                            <span>Seleccionar archivo</span>
                            <span className="text-xs text-muted-foreground">
                              Imagen o PDF (max 10MB)
                            </span>
                          </div>
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Nota sobre verificación */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Una vez recibido y verificado tu comprobante, procesaremos tu pedido.
                    Recibirás una notificación cuando el pago sea confirmado.
                  </p>
                </div>
              </div>
            )}

            {/* What's Next (solo para métodos que no son transferencia) */}
            {!isBankTransfer && (
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
            )}

            {/* Additional Info */}
            {!isBankTransfer && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Nota:</strong> Puedes hacer seguimiento de tu pedido en cualquier momento
                  desde la sección "Mis Pedidos" en tu cuenta.
                </p>
              </div>
            )}
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
