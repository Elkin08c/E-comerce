"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import {
  Users,
  Settings,
  LogOut,
  Package,
  ShoppingCart,
  LayoutDashboard,
  List,
  Truck,
  MapPin,
  Navigation,
  Send,
  Building2,
  ChevronDown,
} from "lucide-react";

interface NavChild {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavChild[];
}

const navigation: NavItem[] = [
  { name: "Panel de Control", href: "/admin", icon: LayoutDashboard },
  { name: "Productos", href: "/admin/catalog/products", icon: Package },
  { name: "Categorías", href: "/admin/catalog/categories", icon: List },
  { name: "Pedidos", href: "/admin/sales/orders", icon: ShoppingCart },
  { name: "Clientes", href: "/admin/sales/customers", icon: Users },
  {
    name: "Logística",
    href: "/admin/logistics",
    icon: Truck,
    children: [
      { name: "Resumen", href: "/admin/logistics" },
      { name: "Zonas", href: "/admin/logistics/zones" },
      { name: "Puntos de Encuentro", href: "/admin/logistics/meeting-points" },
      { name: "Empresas de Transporte", href: "/admin/logistics/transport-companies" },
      { name: "Localizaciones", href: "/admin/logistics/locations" },
    ]
  },
  { name: "Usuarios", href: "/admin/setup/users", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <span className="text-xl font-bold">Panel Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = item.children
              ? pathname.startsWith(item.href)
              : pathname === item.href;
            const isExpanded = item.children && pathname.startsWith(item.href);

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                      }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.children && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"
                        }`}
                    />
                  )}
                </Link>
                {isExpanded && item.children && (
                  <div className="mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block pl-10 pr-2 py-1.5 text-xs font-medium rounded-md transition-colors ${isChildActive
                              ? "bg-gray-700 text-white"
                              : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={async () => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            }).catch(() => { });
            logout();
            router.replace("/admin/auth/login");
          }}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
