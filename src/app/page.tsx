"use client";

import ProductGrid from "@/components/ProductGrid";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
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
                  SOLUCIONES <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                    INDUSTRIALES
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                  Equipamiento profesional de alta resistencia para la industria moderna. Calidad, durabilidad y rendimiento garantizado.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300">
                    <Link href="/catalog">Productos</Link>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="pt-12 flex items-center justify-center lg:justify-start gap-8 lg:gap-12 text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    <CoverageCTA />
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span>Garantía Extendida</span>
                    </div>
                </div>
              </div>
              
              <div className="flex-1 relative w-full max-w-xl lg:max-w-none perspective-1000">
                 <div className="relative z-10 grid grid-cols-12 gap-4 rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                    {/* Main Image Block */}
                    <div className="col-span-8 space-y-4">
                         <div className="aspect-[3/4] rounded-3xl bg-muted shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
                            <Image
                              src="/industrial-equipment.png"
                              alt="Equipamiento Industrial"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
                              <span className="text-2xl font-bold text-white">Equipamiento</span>
                            </div>
                         </div>
                    </div>
                    
                    {/* Secondary Block - Industrial Tools */}
                    <div className="col-span-4 space-y-4 pt-12">
                         <div className="aspect-[3/4] rounded-3xl bg-muted shadow-xl overflow-hidden relative group">
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
                             <Image
                               src="/industrial-tools.png"
                               alt="Herramientas Industriales"
                               fill
                               className="object-cover"
                               sizes="(max-width: 768px) 100vw, 25vw"
                             />
                             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                               <span className="text-lg font-bold text-white">Herramientas</span>
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
                     <h2 className="text-3xl font-bold tracking-tight mb-2">Productos Destacados</h2>
                     <p className="text-muted-foreground">Equipamiento industrial de alta calidad</p>
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
