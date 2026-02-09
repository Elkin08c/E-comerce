'use client';

// import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Zone } from '../../services'; 

interface ZoneDetailsProps {
  zone: Zone | null;
}

export default function ZoneDetails({ zone }: ZoneDetailsProps) {
  if (!zone) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#1559ED] mb-4">Detalles de la Zona</h3>
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-sm">Selecciona una zona</p>
            <p className="text-xs text-gray-400 mt-1">Para ver sus detalles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getzonetypeColor = (zonetype: string) => {
    switch (zonetype) { 
      case 'SECURE':  
        return 'bg-green-500'; 
        
      case 'RESTRICTED':
        return 'bg-yellow-500';
      case 'DANGER':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  const getzonetypeLabel = (zonetype: string) => {
    switch (zonetype) { 
      case 'SECURE':
        return 'Segura'; 
      case 'RESTRICTED':
        return 'Restringida';
      case 'DANGER':
        return 'Peligro';
      default:
        return 'Segura';
    }
  };

  const formatArea = (areaKm2: number) => {
    if (areaKm2 < 1) {
      return `${(areaKm2 * 1000).toFixed(0)} m²`;
    }
    return `${areaKm2.toFixed(2)} km²`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getShippingMethodLabel = (type: string) => {
    switch (type) {
      case 'HOME_DELIVERY':
        return 'Entrega a Domicilio';
      case 'PICKUP_POINT':
        return 'Punto de Retiro';
      case 'STORE_PICKUP':
        return 'Retiro en Tienda';
      default:
        return type;
    }
  };

  const getShippingMethodIcon = (type: string) => {
    switch (type) {
      case 'HOME_DELIVERY':
        return '🏠';
      case 'PICKUP_POINT':
        return '📍';
      case 'STORE_PICKUP':
        return '🏪';
      default:
        return '📦';
    }
  };


  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-[#1559ED] mb-4">Detalles de la Zona</h3>
        
        {/* Información básica */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <p className="text-gray-900 font-medium">{zone.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getzonetypeColor(zone.type || 'SECURE')}`}></div>
                <span className="text-gray-900">{getzonetypeLabel(zone.type || 'SECURE')}</span> 
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-3">
            {zone.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <p className="text-gray-900">{zone.description}</p>
              </div>
            )}

            {zone.shippingPrice && (
              <div>
                <label className="text-sm font-medium text-gray-700">Precio de Envío</label>
                <p className="text-gray-900 font-semibold text-[#1559ED]">${zone.shippingPrice.toFixed(2)} USD</p>
              </div>
            )}
          </div>
        </div>

        {/* Información de la zona */}
        <div className="border-2 border-[#1559ED] rounded-lg p-4 bg-blue-50">
          <h4 className="text-sm font-semibold text-[#1559ED] mb-3">Información de la Zona</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-600">Puntos</label>
              <p className="font-medium text-gray-900">{zone.polygon?.length || 0}</p>
            </div>
            
            <div>
              <label className="text-gray-600">Área</label>
              <p className="font-medium text-gray-900">{formatArea(zone.areaKm2 || 0)}</p>
            </div>
            
            <div>
              <label className="text-gray-600">Creada</label>
              <p className="font-medium text-gray-900">{formatDate(zone.createdAt)}</p>
            </div>
            
            <div>
              <label className="text-gray-600">Actualizada</label>
              <p className="font-medium text-gray-900">{formatDate(zone.updatedAt)}</p>
            </div>
          </div>

          {/* Precio de envío si existe */}
         
        </div>

        {/* Información de ubicación */}
        {zone.city && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ubicación</h4>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">{zone.city.name}</p>
              {zone.city.province && (
                <p className="text-xs text-gray-500">{zone.city.province.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Métodos de Envío Asignados (automáticamente por el backend) */}
        {zone.shippingMethods && zone.shippingMethods.length > 0 && (
          <div className="mt-4 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#FE9124]">
                📦 Métodos de Envío Asignados
              </h4>
              <span className="text-xs text-gray-500 italic">
                (Asignados automáticamente)
              </span>
            </div>

            <div className="space-y-2">
              {zone.shippingMethods.map((method) => (
                <div
                  key={method.id}
                  className="p-3 bg-white rounded-lg border border-orange-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getShippingMethodIcon(method.shippingMethod.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.shippingMethod.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getShippingMethodLabel(method.shippingMethod.type)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-[#FE9124]">
                        ${method.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {method.estimatedDays || method.shippingMethod.estimatedDays} días
                      </p>
                    </div>
                  </div>

                  {!method.isActive && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <span className="text-xs text-red-600 font-medium">
                        ⚠️ Inactivo
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empresa de Transporte (para zonas RESTRICTED) */}
        {zone.transportCompany && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              🚚 Empresa de Transporte
            </h4>
            <p className="font-medium text-gray-900">{zone.transportCompany.name}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
