"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Send } from "lucide-react";
import Link from "next/link";

import { GET_CATEGORIES } from "@/graphql/queries";
import { useQuery } from "@apollo/client/react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { data } = useQuery<any>(GET_CATEGORIES);
  const categories = data?.categories?.edges?.map((edge: any) => edge.node) || [];

  return (
    <footer className="bg-background border-t border-border/40 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">COAVPRO<span className="text-primary">.</span></h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Soluciones industriales de calidad, Equipamiento profesional, componentes y accesorios con garantía extendida.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Tienda</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {categories.slice(0, 6).map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/catalog?category=${cat.id}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li>Cargando catálogo...</li>
              )}
            </ul>
          </div>

          {/* Support Column */}
          {/* <div>
            <h4 className="font-semibold text-lg mb-6">Soporte</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contáctanos</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
            </ul>
          </div> */}

          {/* Newsletter Column */}
          <div>
             <h4 className="font-semibold text-lg mb-6">Mantente Informado</h4>
             <p className="text-muted-foreground text-sm mb-4">
                Suscríbete a nuestro boletín para ofertas exclusivas y novedades.
             </p>
             <form className="flex gap-2" onSubmit={(e) => {
               e.preventDefault();
               const emailInput = e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement;
               if (emailInput?.value) {
                 window.location.href = `mailto:info@coavpro.com?subject=Suscripción al Boletín&body=Me gustaría suscribirme con el correo: ${emailInput.value}`;
               }
             }}>
                <Input type="email" placeholder="Tu correo electrónico" className="bg-secondary/50 border-0 focus-visible:ring-1" required />
                <Button size="icon" type="submit">
                    <Send className="h-4 w-4" />
                </Button>
             </form>
          </div>
        </div>

        {/* <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; {currentYear} COAVPRO. Todos los derechos reservados.</p>
            <div className="flex gap-6">
                <Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link>
                <Link href="#" className="hover:text-foreground transition-colors">Términos</Link>
                <Link href="#" className="hover:text-foreground transition-colors">Mapa del sitio</Link>
            </div>
        </div> */}
      </div>
    </footer>
  );
}
