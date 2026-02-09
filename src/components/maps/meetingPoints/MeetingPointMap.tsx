'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MeetingPoint } from '../../services/logisticsService';
import type { Zone } from '../../services';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MeetingPointMapProps {
  meetingPoints: MeetingPoint[];
  selectedPointId: string | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (point: MeetingPoint) => void;
  tempMarker?: { lat: number; lng: number } | null;
  tempMarkers?: { lat: number; lng: number }[]; // Para modo batch
  selectedZone?: Zone | null;
  allZones?: Zone[]; // Todas las zonas para mostrar en el mapa
  center?: [number, number];
  zoom?: number;
}

export default function MeetingPointMap({
  meetingPoints,
  selectedPointId,
  onMapClick,
  onMarkerClick,
  tempMarker,
  tempMarkers = [],
  selectedZone,
  allZones = [],
  center = [-0.1807, -78.4678], // Quito, Ecuador
  zoom = 13
}: MeetingPointMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const tempMarkersRef = useRef<L.Marker[]>([]);
  const zonePolygonRef = useRef<L.Polygon | null>(null);
  const allZonesPolygonsRef = useRef<L.Polygon[]>([]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      try {
        // CORRECCIÓN: Limpiar todos los layers antes de remover el mapa
        
        // 1. Limpiar marcadores de puntos de encuentro
        Object.values(markersRef.current).forEach(marker => {
          try {
            if (marker && map.hasLayer && map.hasLayer(marker)) {
              map.removeLayer(marker);
            }
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        });
        markersRef.current = {};
        
        // 2. Limpiar marcador temporal
        if (tempMarkerRef.current) {
          try {
            if (map.hasLayer && map.hasLayer(tempMarkerRef.current)) {
              map.removeLayer(tempMarkerRef.current);
            }
          } catch (e) {
            console.warn('Error removing temp marker:', e);
          }
          tempMarkerRef.current = null;
        }
        
        // 3. Limpiar marcadores temporales batch
        tempMarkersRef.current.forEach(marker => {
          try {
            if (marker && map.hasLayer && map.hasLayer(marker)) {
              map.removeLayer(marker);
            }
          } catch (e) {
            console.warn('Error removing temp batch marker:', e);
          }
        });
        tempMarkersRef.current = [];
        
        // 4. Limpiar polígono de zona seleccionada
        if (zonePolygonRef.current) {
          try {
            if (map.hasLayer && map.hasLayer(zonePolygonRef.current)) {
              map.removeLayer(zonePolygonRef.current);
            }
          } catch (e) {
            console.warn('Error removing zone polygon:', e);
          }
          zonePolygonRef.current = null;
        }
        
        // 5. Limpiar todos los polígonos de zonas
        allZonesPolygonsRef.current.forEach(polygon => {
          try {
            if (polygon && map.hasLayer && map.hasLayer(polygon)) {
              map.removeLayer(polygon);
            }
          } catch (e) {
            console.warn('Error removing zone polygon:', e);
          }
        });
        allZonesPolygonsRef.current = [];
        
        // 6. Finalmente, remover el mapa
        if (map && map.remove) {
          map.remove();
        }
        mapRef.current = null;
      } catch (error) {
        console.warn('Error during map cleanup:', error);
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar listener de clicks cuando cambie onMapClick
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remover listeners anteriores
    map.off('click');

    // Agregar nuevo listener si existe onMapClick
    if (onMapClick) {
      const clickHandler = (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      };
      map.on('click', clickHandler);

      // Cambiar cursor para indicar que el mapa es clickeable
      map.getContainer().style.cursor = 'crosshair';

      return () => {
        map.off('click', clickHandler);
        map.getContainer().style.cursor = '';
      };
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [onMapClick]);

  // Actualizar marcadores de puntos de encuentro
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remover marcadores antiguos con protección
    Object.values(markersRef.current).forEach(marker => {
      try {
        if (marker && map.hasLayer && map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      } catch (error) {
        console.warn('Error removing marker:', error);
      }
    });
    markersRef.current = {};

    // Crear iconos personalizados
    const createIcon = (isSelected: boolean, isAvailable: boolean) => {
      const color = !isAvailable ? '#EF4444' : isSelected ? '#1559ED' : '#FE9124';
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 16px;
              font-weight: bold;
            "></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    };

    // Agregar marcadores para cada punto de encuentro
    meetingPoints.forEach(point => {
      const isSelected = point.id === selectedPointId;
      const icon = createIcon(isSelected, point.isAvailable);

      const marker = L.marker([point.latitude, point.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1559ED;">${point.name}</h3>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Dirección:</strong> ${point.address}</p>
            ${point.reference ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Referencia:</strong> ${point.reference}</p>` : ''}
            ${point.contactPhone ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Teléfono:</strong> ${point.contactPhone}</p>` : ''}
            ${point.openingHours ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Horario:</strong> ${point.openingHours}</p>` : ''}
            ${point.capacity ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Capacidad:</strong> ${point.capacity} personas</p>` : ''}
            ${point.description ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Descripción:</strong> ${point.description}</p>` : ''}
            <p style="margin: 4px 0; font-size: 12px; color: ${point.isAvailable ? '#10B981' : '#EF4444'};">
              <strong>${point.isAvailable ? '● Disponible' : '● No disponible'}</strong>
            </p>
          </div>
        `);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(point));
      }

      markersRef.current[point.id] = marker;
    });

    // Ajustar vista si hay puntos
    if (meetingPoints.length > 0) {
      const bounds = L.latLngBounds(
        meetingPoints.map(p => [p.latitude, p.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [meetingPoints, selectedPointId, onMarkerClick]);

  // Actualizar marcador temporal
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remover marcador temporal anterior con protección
    if (tempMarkerRef.current) {
      try {
        if (map.hasLayer && map.hasLayer(tempMarkerRef.current)) {
          map.removeLayer(tempMarkerRef.current);
        }
        tempMarkerRef.current = null;
      } catch (error) {
        console.warn('Error removing temp marker:', error);
        tempMarkerRef.current = null;
      }
    }

    if (tempMarker) {
      const icon = L.divIcon({
        className: 'temp-marker',
        html: `
          <div style="
            background-color: #10b935ff;
            width: 35px;
            height: 35px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 4px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 1.5s ease-in-out infinite;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 18px;
              font-weight: bold;
            "></span>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: rotate(-45deg) scale(1); }
              50% { transform: rotate(-45deg) scale(1.1); }
            }
          </style>
        `,
        iconSize: [35, 35],
        iconAnchor: [17, 35],
      });

      const marker = L.marker([tempMarker.lat, tempMarker.lng], { icon })
        .addTo(map)
        .bindPopup('Nuevo punto de encuentro');

      tempMarkerRef.current = marker;
      map.setView([tempMarker.lat, tempMarker.lng], 16);
    }
  }, [tempMarker]);

  // Actualizar múltiples marcadores temporales (modo batch)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remover marcadores temporales anteriores con protección
    tempMarkersRef.current.forEach(marker => {
      try {
        if (marker && map.hasLayer && map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      } catch (error) {
        console.warn('Error removing temp batch marker:', error);
      }
    });
    tempMarkersRef.current = [];

    // Crear nuevos marcadores temporales
    tempMarkers.forEach((coords, index) => {
      const icon = L.divIcon({
        className: 'temp-batch-marker',
        html: `
          <div style="
            background-color: #10B981;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">${index + 1}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon })
        .addTo(map)
        .bindPopup(`Punto temporal #${index + 1}`);

      tempMarkersRef.current.push(marker);
    });

    // Ajustar vista si hay marcadores temporales
    if (tempMarkers.length > 0) {
      const allCoords = [...tempMarkers];
      if (allCoords.length === 1) {
        map.setView([allCoords[0].lat, allCoords[0].lng], 16);
      } else {
        const bounds = L.latLngBounds(allCoords.map(c => [c.lat, c.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [tempMarkers]);

  // Mostrar todas las zonas en el fondo
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Limpiar polígonos anteriores con protección
    allZonesPolygonsRef.current.forEach(polygon => {
      try {
        if (polygon && map.hasLayer && map.hasLayer(polygon)) {
          map.removeLayer(polygon);
        }
      } catch (error) {
        console.warn('Error removing zone polygon:', error);
      }
    });
    allZonesPolygonsRef.current = [];

    if (allZones.length > 0) {
      allZones.forEach(zone => {
        if (!zone.polygon || zone.polygon.length === 0) return;

        // Verificar si esta zona tiene puntos asignados
        const hasPoints = meetingPoints.some(p => p.zoneId === zone.id);
        const isSelected = selectedZone?.id === zone.id;

        const fillColor = hasPoints ? '#10B981' : '#EF4444';
        const borderColor = hasPoints ? '#059669' : '#DC2626';

        const polygon = L.polygon(zone.polygon, {
          color: borderColor,
          fillColor: fillColor,
          fillOpacity: isSelected ? 0.25 : 0.12,
          weight: isSelected ? 3 : 1.5,
          opacity: isSelected ? 0.9 : 0.4,
        }).addTo(map);

        const pointsInZone = meetingPoints.filter(p => p.zoneId === zone.id);
        const activePoints = pointsInZone.filter(p => p.isAvailable);

        polygon.bindPopup(`
          <div style="min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; color: ${borderColor};">
              ${zone.name}
            </h3>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Estado:</strong> ${hasPoints
                ? `${activePoints.length}/${pointsInZone.length} puntos activos`
                : 'Sin puntos asignados'}
            </p>
          </div>
        `);

        allZonesPolygonsRef.current.push(polygon);
      });
    }
  }, [allZones, meetingPoints, selectedZone]);

  // Mostrar y hacer zoom a la zona seleccionada
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remover polígono de zona seleccionada anterior con protección
    if (zonePolygonRef.current) {
      try {
        if (map.hasLayer && map.hasLayer(zonePolygonRef.current)) {
          map.removeLayer(zonePolygonRef.current);
        }
        zonePolygonRef.current = null;
      } catch (error) {
        console.warn('Error removing selected zone polygon:', error);
        zonePolygonRef.current = null;
      }
    }

    if (selectedZone && selectedZone.polygon && selectedZone.polygon.length > 0) {
      const bounds = L.latLngBounds(selectedZone.polygon);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [selectedZone]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg" />;
}
