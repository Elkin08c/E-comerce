"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/graphql/queries";
import { ShoppingBag, Search, User, Menu, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerAuthService } from "@/lib/services/customer-auth.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { CartSheet } from "@/components/cart/CartSheet";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { toggleCart, items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const { data, loading } = useQuery<any>(GET_CATEGORIES);
   const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, setUser, logout: logoutStore } = useAuthStore();
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

  const categories = data?.categories?.edges?.map((edge: any) => edge.node) || [];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-20 items-center px-4 gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-semibold">
                Inicio
              </Link>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="text-lg text-muted-foreground hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                ))
              )}
            </nav>
          </SheetContent>
        </Sheet>

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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {categories.slice(0, 5).map((cat: any) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search Bar - Hidden on small mobile */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative max-w-[200px] lg:max-w-[300px] w-full mr-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-9 h-9 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-input transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
            <Search className="h-5 w-5 md:hidden" />
            <ShoppingCart className="h-5 w-5 hidden md:block" />
            <span className="sr-only">Carrito</span>
            {cartCount > 0 && (
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
                    window.location.reload();
                }}>
                    Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link href="/login">Ingresar</Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href="/register">Registrarse</Link>
                </Button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}
