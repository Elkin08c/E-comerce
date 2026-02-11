"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogIn, UserPlus, ShoppingBag } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
}

export function LoginModal({ open, onOpenChange, redirectPath = "/" }: LoginModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    if (redirectPath) {
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
    }
    router.push("/login");
    onOpenChange(false);
  };

  const handleRegister = () => {
    if (redirectPath) {
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
    }
    router.push("/register");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Inicia Sesión para Continuar
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Para proceder con tu compra, necesitas tener una cuenta. Esto nos permite
            procesar tu pedido de forma segura y mantener un registro de tus compras.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleLogin}
            size="lg"
            className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Iniciar Sesión
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          <Button
            onClick={handleRegister}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-semibold border-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Crear Cuenta Nueva
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShoppingBag className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs">
              Tus productos permanecerán en el carrito mientras inicias sesión
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
