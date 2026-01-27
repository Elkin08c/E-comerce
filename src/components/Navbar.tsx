"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/graphql/queries";
import { ShoppingBag, Search, User, Menu, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function Navbar() {
  const { data, loading } = useQuery<any>(GET_CATEGORIES);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    setIsAuthenticated(!!localStorage.getItem("token"));
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
      <div className="container mx-auto flex h-16 items-center px-4 gap-4">
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
                Home
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
          <div className="bg-primary p-1.5 rounded-lg">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            LUPA <span className="text-primary">Store</span>
          </span>
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
        <div className="hidden md:flex items-center relative max-w-[200px] lg:max-w-[300px] w-full mr-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9 h-9 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-input transition-all"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Search className="h-5 w-5 md:hidden" />
            <ShoppingCart className="h-5 w-5 hidden md:block" />
            <span className="sr-only">Cart</span>
            {/* Hardcoded Badge for visual */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full md:hidden" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center hidden md:flex">
              2
            </span>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                   <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                     U
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Orders</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    localStorage.removeItem("token");
                    window.location.reload();
                }}>
                    Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href="/register">Sign up</Link>
                </Button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}
