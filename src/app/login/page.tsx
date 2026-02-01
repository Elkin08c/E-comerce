"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/services/auth.service";
import { useCartStore } from "@/store/cart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authService.login({ email, password });

      const token = data.accessToken || data.token || data.access_token;
      
      if (!token) {
        throw new Error("No se recibió token del servidor");
      }

      localStorage.setItem("token", token);
      
      // Sync cart after login
      useCartStore.getState().fetchCart();

      if (data.customer) {
        if (data.customer.firstName) {
            localStorage.setItem("customerName", data.customer.firstName);
        }
        if (data.customer.id) {
            localStorage.setItem("customerId", data.customer.id);
        }
      }
      router.push("/"); 
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
             <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo y contraseña para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 font-medium text-center">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Ingresar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
           <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
