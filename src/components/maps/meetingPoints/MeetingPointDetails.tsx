'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Clock, Users, FileText, Navigation } from 'lucide-react';
import { type MeetingPoint } from '../../services/logisticsService';

interface MeetingPointDetailsProps {
  meetingPoint: MeetingPoint | null;
}

export default function MeetingPointDetails({ meetingPoint }: MeetingPointDetailsProps) {
  if (!meetingPoint) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#1559ED] mb-4">Detalles del Punto</h3>
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm">Selecciona un punto de encuentro para ver sus detalles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    return meetingPoint.isAvailable ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Disponible
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        No disponible
      </span>
    );
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${meetingPoint.latitude},${meetingPoint.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#1559ED]">Detalles del Punto</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nombre del lugar */}
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <MapPin className="w-6 h-6 text-[#FE9124]" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700">Nombre del Lugar</h4>
            <p className="text-gray-900 font-semibold">{meetingPoint.name}</p>
          </div>
        </div>

        {/* Zona asociada */}
        {meetingPoint.zone && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🔴</span>
              <h4 className="text-sm font-medium text-red-800">Zona Peligrosa</h4>
            </div>
            <p className="font-medium text-gray-900">{meetingPoint.zone.name}</p>
          </div>
        )}

        {/* Dirección */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Navigation className="w-5 h-5 text-gray-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700">Dirección</h4>
            <p className="text-gray-900">{meetingPoint.address}</p>
            <button
              onClick={openInMaps}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
            >
              Ver en Google Maps →
            </button>
          </div>
        </div>

        {/* Coordenadas */}
        {typeof meetingPoint.latitude === 'number' && typeof meetingPoint.longitude === 'number' && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Coordenadas</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Lat:</span>
                <span className="ml-2 font-mono text-gray-900">{meetingPoint.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Lng:</span>
                <span className="ml-2 font-mono text-gray-900">{meetingPoint.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Teléfono */}
        {meetingPoint.contactPhone && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-700">Teléfono de Contacto</h4>
              <p className="text-gray-900">{meetingPoint.contactPhone}</p>
            </div>
          </div>
        )}

        {/* Horario */}
        {meetingPoint.openingHours && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-700">Horario de Atención</h4>
              <p className="text-gray-900">{meetingPoint.openingHours}</p>
            </div>
          </div>
        )}

        {/* Capacidad */}
        {meetingPoint.capacity && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-700">Capacidad Diaria</h4>
              <p className="text-gray-900 font-semibold">{meetingPoint.capacity} pedidos/día</p>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        {meetingPoint.description && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Instrucciones</h4>
              <p className="text-gray-900 text-sm">{meetingPoint.description}</p>
            </div>
          </div>
        )}

        {/* Información de fechas */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Creado: {new Date(meetingPoint.createdAt).toLocaleDateString()}</p>
            <p>Actualizado: {new Date(meetingPoint.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
