"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Settings, 
  LogOut, 
  Package, 
  ShoppingCart,
  LayoutDashboard, 
  List
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/catalog/products", icon: Package },
  { name: "Categories", href: "/admin/catalog/categories", icon: List },
  { name: "Orders", href: "/admin/sales/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/sales/customers", icon: Users },
  { name: "Users", href: "/admin/setup/users", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <span className="text-xl font-bold">Admin Panel</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={async () => {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }).catch(() => {});
            window.location.href = "/admin/auth/login";
          }}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
