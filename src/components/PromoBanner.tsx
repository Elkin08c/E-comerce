"use client";

import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PromoBanner() {
    return (
        <div className="w-full py-12 md:py-20">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 shadow-2xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24">
                <div className="absolute inset-0 -z-10 opacity-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.white),transparent)]" />
                <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-1 lg:py-32 lg:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Potencia tu producción.<br />
                        Equipamiento de última generación.
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
                        Descubre nuestras soluciones en maquinaria personalizadas para tu empresa. Eficiencia y precisión garantizada para tu negocio.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                        <Button asChild size="lg" variant="secondary" className="group">
                            <Link href="/catalog">
                                Ver Catálogo <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Link href="/contact" className="text-sm font-semibold leading-6 text-white hover:text-white/80 transition-colors">
                            Contactar Ventas <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
                <div className="relative mt-16 h-80 w-full lg:mt-0 lg:flex-1 lg:h-auto rounded-xl overflow-hidden">
                    <div className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10" />
                    {/* You can add an image here if available, for now using a decorative gradient/shape */}
                    <Image
                        src="/publi.jpg"
                        alt="Equipamiento Industrial"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-0 md:left-20 w-full h-full bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    );
}
