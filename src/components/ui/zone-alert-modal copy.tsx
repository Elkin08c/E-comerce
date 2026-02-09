'use client';

import { MapPin, Truck } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ZoneAlertModalProps {
  isOpen: boolean;
  zoneType: 'DANGER' | 'RESTRICTED';
  zoneName: string;
  onClose: () => void;
  onAction: () => void;
}

export default function ZoneAlertModal({
  isOpen,
  zoneType,
  zoneName,
  onClose,
  onAction
}: ZoneAlertModalProps) {
  if (!isOpen) return null;

  const getAlertContent = () => {
    if (zoneType === 'DANGER') {
      return {
        icon: <MapPin className="w-12 h-12 text-red-500" />,
        title: '⚠️ Zona Peligrosa Creada',
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        message: (
          <div className="space-y-3">
            <p className="text-gray-700">
              Has creado la zona <span className="font-semibold">"{zoneName}"</span> como <span className="font-semibold text-red-600">PELIGROSA</span>.
            </p>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                📍 Acción requerida:
              </p>
              <p className="text-sm text-gray-700">
                Debes crear al menos <span className="font-semibold">1 punto de encuentro</span> para esta zona.
                Se recomienda crear 2-3 puntos para mayor cobertura.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Los puntos de encuentro deben incluir:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Nombre del lugar</li>
                <li>Dirección exacta</li>
                <li>Coordenadas (click en mapa)</li>
                <li>Horarios de atención</li>
                <li>Capacidad diaria</li>
                <li>Teléfono de contacto</li>
              </ul>
            </div>
          </div>
        ),
        actionText: 'Crear Puntos de Encuentro',
        laterText: 'Crear Después'
      };
    } else {
      return {
        icon: <Truck className="w-12 h-12 text-yellow-600" />,
        title: '⚠️ Zona Restringida Creada',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        message: (
          <div className="space-y-3">
            <p className="text-gray-700">
              Has creado la zona <span className="font-semibold">"{zoneName}"</span> como <span className="font-semibold text-yellow-600">RESTRINGIDA</span>.
            </p>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 font-medium mb-2">
                🚚 Acción requerida:
              </p>
              <p className="text-sm text-gray-700">
                Debes asignar una <span className="font-semibold">empresa de transporte</span> a esta zona.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">La empresa de transporte debe:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Estar registrada en el sistema</li>
                <li>Tener cobertura en esta parroquia</li>
                <li>Estar activa y disponible</li>
              </ul>
            </div>
          </div>
        ),
        actionText: 'Asignar Empresa de Transporte',
        laterText: 'Asignar Después'
      };
    }
  };

  const content = getAlertContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl mx-4">
        <Card className={`${content.bgColor} border-2 ${content.borderColor}`}>
          <CardHeader>
            <div className="flex items-center gap-4">
              {content.icon}
              <CardTitle className="text-xl text-gray-900">
                {content.title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {content.message}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={onAction}
                className="flex-1 bg-[#FE9124] hover:bg-[#FE9124]/90 text-white"
              >
                {content.actionText}
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                {content.laterText}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
              Puedes configurar esto más tarde desde la lista de zonas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
