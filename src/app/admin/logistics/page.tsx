"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logisticsService, Zone } from "@/lib/services/logistics.service";
import {
  Truck,
  MapPin,
  Send,
  Navigation,
  Building2,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function LogisticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, zonesData] = await Promise.all([
          logisticsService.getOverview(),
          logisticsService.getZones(),
        ]);
        setOverview(overviewData);
        setZones(zonesData);
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de logística");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const stats = [
    {
      label: "Total de Zonas",
      value: overview?.totalZones || zones.length,
      icon: MapPin,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/admin/logistics/zones",
    },
    {
      label: "Empresas de Transporte",
      value: overview?.totalTransportCompanies || 0,
      icon: Truck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      href: "/admin/logistics/transport-companies",
    },
    {
      label: "Métodos de Envío",
      value: overview?.totalShippingMethods || 0,
      icon: Send,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      href: "/admin/logistics/shipping-methods",
    },
    {
      label: "Puntos de Encuentro",
      value: overview?.totalMeetingPoints || 0,
      icon: Navigation,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      href: "/admin/logistics/meeting-points",
    },
  ];

  const quickLinks = [
    {
      title: "Zonas de Entrega",
      description: "Gestiona las zonas de cobertura, tipos y precios de envío.",
      icon: MapPin,
      href: "/admin/logistics/zones",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Métodos de Envío",
      description: "Configura los métodos de entrega disponibles y sus costos.",
      icon: Send,
      href: "/admin/logistics/shipping-methods",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Puntos de Encuentro",
      description: "Administra los puntos de recogida para entregas en zonas restringidas.",
      icon: Navigation,
      href: "/admin/logistics/meeting-points",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Empresas de Transporte",
      description: "Gestiona las empresas y contactos de transporte.",
      icon: Building2,
      href: "/admin/logistics/transport-companies",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Gestión de Logística
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.iconBg} rounded-md p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {stat.value}
                </dd>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="p-6 flex items-start gap-4">
              <div className={`flex-shrink-0 ${link.bg} rounded-lg p-3`}>
                <link.icon className={`h-6 w-6 ${link.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{link.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
