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
import MapSelectorDynamic from "@/components/ui/MapSelectorDynamic";

interface CoverageCheckerProps {
  trigger?: ReactNode;
}

const ZONE_TYPE_CONFIG = {
  SECURE: {
    icon: ShieldCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Zona con cobertura",
    description: "Entrega directa a domicilio disponible.",
  },
  RESTRICTED: {
    icon: ShieldAlert,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    label: "Zona con restricciones",
    description: "Entrega disponible con condiciones especiales.",
  },
  DANGER: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Zona con restricciones",
    description: "Entrega en punto de encuentro cercano.",
  },
} as const;

export default function CoverageChecker({ trigger }: CoverageCheckerProps) {
  const [showMap, setShowMap] = useState(false);
  const { status, primaryZone, errorMessage, detectLocation, checkCoverage, latitude, longitude } = useLocationStore();
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

  const handleManualSelect = (lat: number, lng: number) => {
    checkCoverage(lat, lng);
    // setShowMap(false); // Keep map open for inline feedback
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && status === "idle") {
      // detectLocation(); // Don't auto-detect immediately if we want to give option
      // However, typical UX is to try auto-detect first.
      // Let's keep auto-detect but offer manual override if it fails or user wants to change.
      detectLocation();
    }
  };

  const isLoading = status === "requesting" || status === "loading";
  const isError = status === "denied" || status === "unavailable" || status === "error";
  const hasCoverage = status === "resolved" && primaryZone !== null;
  const noCoverage = status === "resolved" && primaryZone === null;

  const renderContent = () => {
    if (showMap) {
      return (
        <div className="space-y-4">
          <MapSelectorDynamic
            onLocationSelect={handleManualSelect}
            initialLat={latitude || undefined}
            initialLng={longitude || undefined}
          />

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm">Verificando cobertura...</p>
            </div>
          )}

          {!isLoading && hasCoverage && (
            <div className="space-y-3">
              <div className={`flex items-start gap-3 p-3 rounded-lg ${ZONE_TYPE_CONFIG[primaryZone.type].bg}`}>
                {(() => {
                  const Icon = ZONE_TYPE_CONFIG[primaryZone.type].icon;
                  return <Icon className={`h-5 w-5 ${ZONE_TYPE_CONFIG[primaryZone.type].color} shrink-0 mt-0.5`} />;
                })()}
                <div>
                  <p className={`font-semibold text-sm ${ZONE_TYPE_CONFIG[primaryZone.type].color}`}>
                    {ZONE_TYPE_CONFIG[primaryZone.type].label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ZONE_TYPE_CONFIG[primaryZone.type].description}
                  </p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setShowMap(false)}>
                Confirmar ubicación
              </Button>
            </div>
          )}

          {!isLoading && noCoverage && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-100">
                <MapPinOff className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-gray-700">Fuera de cobertura</p>
                  Actualmente operamos en tu zona.
                </div>
              </div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              <p className="font-medium">Error al verificar</p>
              <p className="text-xs mt-1">{errorMessage}</p>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => setShowMap(false)}>
            {hasCoverage ? "Volver" : "Cancelar"}
          </Button>
        </div>
      )
    }

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

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={handleDetect}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar de nuevo
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowMap(true)}>
              <MapPin className="h-4 w-4 mr-2" />
              Seleccionar en el mapa
            </Button>
          </div>
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
                Actualmente operamos en tu zona.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={handleDetect}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar de nuevo
            </Button>
            <Button className="w-full" onClick={() => setShowMap(true)}>
              <MapPin className="h-4 w-4 mr-2" />
              Seleccionar en el mapa manualmente
            </Button>
          </div>
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
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleDetect}>
              Reintentar
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowMap(true)}>
              <MapPin className="h-4 w-4 mr-2" />
              Seleccionar ubicación manualmente
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verificar Cobertura</DialogTitle>
          <DialogDescription>
            {showMap
              ? "Haz clic en el mapa para seleccionar tu ubicación exacta."
              : "Detectamos tu ubicación para verificar si hay cobertura de envío en tu zona."}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
