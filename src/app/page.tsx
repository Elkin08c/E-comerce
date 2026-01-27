"use client";

import ProductGrid from "@/components/ProductGrid";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw } from "lucide-react";

export default function StorefrontHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-28">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 text-center lg:text-left space-y-8">
                 <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    Now Available: Summer Collection 2026
                 </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Discover <span className="text-primary relative inline-block">
                    Premium
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                    </svg>
                  </span> <br />
                  Quality Products
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Elevate your lifestyle with our curated selection of high-end electronics, fashion, and accessories. Designed for those who appreciate excellence.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                    <Link href="/register">Start Shopping</Link>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
                    <Link href="/login">View Catalog</Link>
                  </Button>
                </div>
                
                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Truck className="h-4 w-4 text-primary" />
                        </div>
                        Free Shipping
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        Secure Payment
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <RefreshCw className="h-4 w-4 text-primary" />
                        </div>
                        30-Day Returns
                    </div>
                </div>
              </div>
              
              <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                 {/* Abstract simplified visual representation instead of a complex image for now */}
                 <div className="relative aspect-square rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-3xl opacity-30 absolute -top-20 -right-20 w-[150%] h-[150%] animate-pulse duration-[10s]"></div>
                 
                 <div className="relative z-10 grid grid-cols-2 gap-4">
                    <div className="space-y-4 mt-12">
                         <div className="aspect-[3/4] rounded-2xl bg-muted/50 backdrop-blur-sm border shadow-lg overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <span className="text-white font-bold">Electronics</span>
                            </div>
                            {/* Placeholder visual */}
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                         </div>
                         <div className="aspect-square rounded-2xl bg-primary/5 border shadow-lg flex items-center justify-center">
                              <Star className="h-12 w-12 text-primary/40" />
                         </div>
                    </div>
                    <div className="space-y-4">
                         <div className="aspect-square rounded-2xl bg-secondary/30 border shadow-lg flex items-center justify-center">
                            <span className="text-4xl font-black text-secondary-foreground/20">2026</span>
                         </div>
                         <div className="aspect-[3/4] rounded-2xl bg-muted/50 backdrop-blur-sm border shadow-lg overflow-hidden relative group">
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <span className="text-white font-bold">Fashion</span>
                            </div>
                            {/* Placeholder visual */}
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
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
                     <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Collection</h2>
                     <p className="text-muted-foreground">Handpicked items just for you</p>
                </div>
                <Button variant="outline">View All Products</Button>
            </div>
            <ProductGrid />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">LUPA Store</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Redefining the online shopping experience with quality, speed, and exceptional customer service.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Shop</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#" className="hover:text-primary transition-colors">Electronics</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Fashion</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Home & Living</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">New Arrivals</a></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold mb-4">Stay Connected</h4>
                    <div className="flex gap-4">
                        {/* Social Placeholders */}
                        <div className="h-8 w-8 rounded-full bg-secondary hover:bg-primary/20 transition-colors cursor-pointer"></div>
                        <div className="h-8 w-8 rounded-full bg-secondary hover:bg-primary/20 transition-colors cursor-pointer"></div>
                        <div className="h-8 w-8 rounded-full bg-secondary hover:bg-primary/20 transition-colors cursor-pointer"></div>
                    </div>
                </div>
            </div>
            <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                 <p className="text-sm text-muted-foreground">
                    &copy; 2026 Coavpro E-commerce. All rights reserved.
                </p>
                 <div className="flex gap-6 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground">Privacy Policy</a>
                    <a href="#" className="hover:text-foreground">Terms of Service</a>
                 </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
