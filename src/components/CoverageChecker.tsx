"use client";

import { ReactNode, useEffect, useState } from "react";
import { useLocationStore } from "@/store/location";
import { logisticsService, MeetingPoint } from "@/lib/services/logistics.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MapPinOff,
  AlertCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface CoverageCheckerProps {
  trigger?: ReactNode;
}

const ZONE_TYPE_CONFIG = {
  SECURE: {
    icon: ShieldCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Zona Segura",
    description: "Entrega directa a domicilio disponible.",
  },
  RESTRICTED: {
    icon: ShieldAlert,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    label: "Zona Restringida",
    description: "Entrega disponible con condiciones especiales.",
  },
  DANGER: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Zona de Riesgo",
    description: "Entrega en punto de encuentro seguro.",
  },
} as const;

export default function CoverageChecker({ trigger }: CoverageCheckerProps) {
  const { status, primaryZone, errorMessage, detectLocation } = useLocationStore();
  const [open, setOpen] = useState(false);
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [loadingMPs, setLoadingMPs] = useState(false);

  useEffect(() => {
    if (primaryZone?.type === "DANGER" && open) {
      setLoadingMPs(true);
      logisticsService
        .getAvailableMeetingPointsByZone(primaryZone.id)
        .then(setMeetingPoints)
        .catch(() => setMeetingPoints([]))
        .finally(() => setLoadingMPs(false));
    } else {
      setMeetingPoints([]);
    }
  }, [primaryZone, open]);

  const handleDetect = () => {
    detectLocation();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && status === "idle") {
      detectLocation();
    }
  };

  const isLoading = status === "requesting" || status === "loading";
  const isError = status === "denied" || status === "unavailable" || status === "error";
  const hasCoverage = status === "resolved" && primaryZone !== null;
  const noCoverage = status === "resolved" && primaryZone === null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Detectando tu ubicación...</p>
        </div>
      );
    }

    if (hasCoverage) {
      const config = ZONE_TYPE_CONFIG[primaryZone.type];
      const Icon = config.icon;

      return (
        <div className="space-y-4">
          <div className={`flex items-start gap-4 p-4 rounded-lg ${config.bg}`}>
            <Icon className={`h-8 w-8 ${config.color} shrink-0 mt-0.5`} />
            <div>
              <p className={`font-semibold ${config.color}`}>{config.label}</p>
              <p className="text-lg font-medium mt-1">{primaryZone.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            </div>
          </div>

          {primaryZone.type === "DANGER" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Puntos de encuentro disponibles:</p>
              {loadingMPs ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando puntos de encuentro...
                </div>
              ) : meetingPoints.length > 0 ? (
                <div className="space-y-2">
                  {meetingPoints.map((mp) => (
                    <div key={mp.id} className="flex items-start gap-2 p-3 border rounded-lg text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{mp.name}</p>
                        <p className="text-muted-foreground">{mp.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay puntos de encuentro disponibles.</p>
              )}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={handleDetect}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar de nuevo
          </Button>
        </div>
      );
    }

    if (noCoverage) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 py-6">
            <MapPinOff className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-semibold">Fuera de cobertura</p>
              <p className="text-sm text-muted-foreground mt-1">
                Actualmente operamos en el área de Cuenca.
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleDetect}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar de nuevo
          </Button>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4 py-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="text-center">
              <p className="font-semibold">No se pudo detectar tu ubicación</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            </div>
          </div>
          <Button className="w-full" onClick={handleDetect}>
            Reintentar
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar Cobertura</DialogTitle>
          <DialogDescription>
            Detectamos tu ubicación para verificar si hay cobertura de envío en tu zona.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
