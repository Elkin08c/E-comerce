"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";

import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/graphql/queries";

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
            <h3 className="text-2xl font-bold tracking-tight">LuxeStore<span className="text-primary">.</span></h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Elevating your lifestyle with curated premium products. Experience quality and design in every detail.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Shop</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {categories.slice(0, 6).map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li>Scanning catalog...</li>
              )}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
             <h4 className="font-semibold text-lg mb-6">Stay Updated</h4>
             <p className="text-muted-foreground text-sm mb-4">
                Subscribe to our newsletter for exclusive offers and updates.
             </p>
             <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <Input type="email" placeholder="Your email address" className="bg-secondary/50 border-0 focus-visible:ring-1" />
                <Button size="icon" type="submit">
                    <Send className="h-4 w-4" />
                </Button>
             </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; {currentYear} LuxeStore Inc. All rights reserved.</p>
            <div className="flex gap-6">
                <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
                <Link href="#" className="hover:text-foreground transition-colors">Sitemap</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
