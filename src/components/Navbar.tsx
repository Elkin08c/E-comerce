"use client";

import CoverageChecker from "@/components/CoverageChecker";
import { CartSheet } from "@/components/cart/CartSheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { customerAuthService } from "@/lib/services/customer-auth.service";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useLocationStore } from "@/store/location";
import { MapPin, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { toggleCart, items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, logout: logoutStore } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    // Marcar como montado para evitar errores de hidratación
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);

    // El estado de autenticación ya se maneja con Zustand + sessionStorage
    // No necesitamos llamar a getProfile porque el estado persiste automáticamente

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
<<<<<<< HEAD
        ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
        : "bg-transparent border-b border-transparent"
=======
          ? "bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg"
          : "bg-background/60 backdrop-blur-sm border-b border-border/20"
>>>>>>> origin/feature-cambios
        }`}
    >
      <div className="container mx-auto flex h-20 items-center px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6 shrink-0">
          <Image
            src="/logo.png"
            alt="COAVPRO"
            width={200}
            height={64}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex-1" />

        {/* Search Bar - Hidden on small mobile */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-[200px] lg:max-w-[320px] w-full mr-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-10 pr-4 h-10 bg-muted/40 border-border/40 rounded-full focus-visible:bg-background focus-visible:border-primary/50 focus-visible:shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {isMounted ? (
            <CoverageChecker
              trigger={
                <Button variant="ghost" size="icon" className="relative">
                  <MapPin className="h-5 w-5" />
                  <span className="sr-only">Verificar cobertura</span>
                  <LocationDot />
                </Button>
              }
            />
          ) : (
            <Button variant="ghost" size="icon" className="relative">
              <MapPin className="h-5 w-5" />
              <span className="sr-only">Verificar cobertura</span>
              <LocationDot />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
            <Search className="h-5 w-5 md:hidden" />
            <ShoppingCart className="h-5 w-5 hidden md:block" />
            <span className="sr-only">Carrito</span>
            {isMounted && cartCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full md:hidden" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center hidden md:flex">
                  {cartCount}
                </span>
              </>
            )}
          </Button>
          <CartSheet />

          {!isMounted ? (
            // Durante SSR y antes de la hidratación, mostrar estado neutral
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  Mi Cuenta
                  <div className="text-xs font-normal text-muted-foreground">
                    {user?.name}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account/profile" className="w-full cursor-pointer">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/addresses" className="w-full cursor-pointer">Direcciones</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders" className="w-full cursor-pointer">Mis Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  await customerAuthService.logout();
                  logoutStore();
                  useCartStore.getState().clearCart();
                  window.location.reload();
                }}>
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex font-medium hover:bg-primary/10 transition-all">
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button size="sm" asChild className="font-medium shadow-sm hover:shadow-md transition-all">
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function LocationDot() {
  const { status, primaryZone } = useLocationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status !== "resolved") return null;

  const dotColor = !primaryZone
    ? "bg-gray-400"
    : primaryZone.type === "SECURE"
      ? "bg-green-500"
      : primaryZone.type === "RESTRICTED"
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <span className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ${dotColor}`} />
  );
}
