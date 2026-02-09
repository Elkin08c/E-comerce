"use client";

import ProductGrid from "@/components/ProductGrid";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw, Loader2, MapPinOff, CheckCircle2 } from "lucide-react";
import { useLocationStore } from "@/store/location";

export default function StorefrontHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-32 lg:pb-40 bg-background">
           {/* Background Decorative Elements */}
           <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -skew-x-12 transform origin-top-right z-0"></div>
           <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/5 rounded-tr-[100px] z-0"></div>

          <div className="container mx-auto px-4 relative z-10 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="flex-1 text-center lg:text-left space-y-10 animate-fade-in-up">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9]">
                  TU MUNDO <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                    CONECTADO
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                  Descubre la última tecnología que potencia tu día a día. Rendimiento y calidad en cada dispositivo.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                    <Link href="/catalog">Categorías</Link>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full hover:bg-secondary/50 border-2">
                    <Link href="/category/new-arrivals">Novedades</Link>
                  </Button>
                </div>
                
                <div className="pt-12 flex items-center justify-center lg:justify-start gap-8 lg:gap-12 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    <CoverageCTA />
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span>Garantía de por Vida</span>
                    </div>
                </div>
              </div>
              
              <div className="flex-1 relative w-full max-w-xl lg:max-w-none perspective-1000">
                 <div className="relative z-10 grid grid-cols-12 gap-4 rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                    {/* Main Image Block */}
                    <div className="col-span-8 space-y-4">
                         <div className="aspect-[3/4] rounded-3xl bg-muted shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                            {/* In a real app, use Next.js Image */}
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <span className="text-4xl font-bold text-gray-400">Moda</span>
                            </div>
                         </div>
                    </div>
                    
                    {/* Secondary Blocks */}
                    <div className="col-span-4 space-y-4 pt-12">
                         <div className="aspect-square rounded-3xl bg-primary text-primary-foreground shadow-xl flex flex-col items-center justify-center p-4 text-center transform hover:-translate-y-2 transition-transform duration-300">
                            <span className="text-5xl font-black">50%</span>
                            <span className="text-sm font-bold uppercase mt-1">Oferta</span>
                         </div>
                         <div className="aspect-[3/4] rounded-3xl bg-muted shadow-xl overflow-hidden relative">
                             <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-400">Tech</span>
                            </div>
                         </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
                <div>
                     <h2 className="text-3xl font-bold tracking-tight mb-2">Colección Destacada</h2>
                     <p className="text-muted-foreground">Artículos seleccionados solo para ti</p>
                </div>
                <Button variant="outline">Ver Todos</Button>
            </div>
            <ProductGrid />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function CoverageCTA() {
  const { status, primaryZone, detectLocation } = useLocationStore();

  if (status === "requesting" || status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
        <span>Verificando cobertura...</span>
      </div>
    );
  }

  if (status === "resolved" && primaryZone) {
    return (
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span>Envío disponible: {primaryZone.name}</span>
      </div>
    );
  }

  if (status === "resolved" && !primaryZone) {
    return (
      <div className="flex items-center gap-3">
        <MapPinOff className="h-5 w-5 text-muted-foreground" />
        <span>Fuera de cobertura</span>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <button
        onClick={detectLocation}
        className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer"
      >
        <Truck className="h-5 w-5 text-primary" />
        <span>Verifica tu cobertura</span>
      </button>
    );
  }

  // denied / unavailable / error — show static fallback
  return (
    <div className="flex items-center gap-3">
      <Truck className="h-5 w-5 text-primary" />
      <span>Envíos a Nivel Cuenca</span>
    </div>
  );
}
