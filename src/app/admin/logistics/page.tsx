"use client";

import { useEffect, useState } from "react";
import { logisticsService, Zone, MeetingPoint } from "@/lib/services/logistics.service";
import { Truck, MapPin, CreditCard, Activity, ShieldCheck, AlertTriangle } from "lucide-react";

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
          logisticsService.getZones()
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

  if (loading) return <div className="p-8">Cargando logística...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Logística</h1>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Total de Zonas</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{overview?.totalZones || zones.length}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Empresas de Transporte</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{overview?.totalTransportCompanies || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Métodos de Envío</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{overview?.totalShippingMethods || 0}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Listado de Zonas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Zonas de Entrega</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {zones.map((zone) => (
              <li key={zone.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {zone.type === "SECURE" ? (
                      <ShieldCheck className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                      <p className="text-xs text-gray-500">Tipo: {zone.type === 'SECURE' ? 'Segura' : 'Peligrosa (Requiere Punto Encuentro)'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {zone.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {zones.length === 0 && <li className="px-4 py-6 text-center text-gray-500">No hay zonas configuradas</li>}
          </ul>
        </div>

        {/* Información Geocoding Status / Backend Health */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Estado de Servicios Externos</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-gray-700">Google Maps Geocoding</span>
              </div>
              <span className="text-xs font-bold text-green-600">OPERATIVO</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-orange-500 mr-3" />
                <span className="text-sm font-medium text-gray-700">Nominatim (OSM)</span>
              </div>
              <span className="text-xs font-bold text-green-600">OPERATIVO</span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Estos servicios son utilizados por el backend para validar direcciones y asignar zonas de entrega automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
