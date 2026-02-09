"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/auth";

const AUTH_ROUTES = ["/admin/auth/login", "/admin/auth/register"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    // Si no está autenticado y NO está en una página de auth, redirigir al login
    if (!isAuthenticated && !isAuthPage) {
      router.replace("/admin/auth/login");
    }
  }, [hydrated, isAuthenticated, isAuthPage, router]);

  // Páginas de auth: renderizar sin sidebar
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black">
        {children}
      </div>
    );
  }

  // Mientras se hidrata el estado de auth, mostrar loading
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
