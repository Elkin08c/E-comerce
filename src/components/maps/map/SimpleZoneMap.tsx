'use client';

import React from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet - Usar archivos locales en lugar de CDN
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface SimpleZoneMapProps {
  onPolygonComplete: (coordinates: [number, number][]) => void;
  onPolygonChange: (coordinates: [number, number][]) => void;
  onPointDrag?: (index: number, newPosition: [number, number]) => void;
  onPointDelete?: (index: number) => void;
  isDrawing: boolean;
  currentPolygon: [number, number][];
  completedZones?: [number, number][][];
  existingZones?: Array<{
    id: string;
    name: string;
    polygon: [number, number][];
    type: 'SECURE' | 'RESTRICTED' | 'DANGER';
  }>;
  center?: [number, number];
  zoneType?: 'SECURE' | 'RESTRICTED' | 'DANGER';
  zoom?: number;
  bounds?: [[number, number], [number, number]]; // [[minLat, minLng], [maxLat, maxLng]]
  onZoneEdit?: (zone: {
    id: string;
    polygon: [number, number][];
    type: 'SECURE' | 'RESTRICTED' | 'DANGER';
  }) => void;
  onZoneSelect?: (zone: {
    id: string;
    polygon: [number, number][];
    type: 'SECURE' | 'RESTRICTED' | 'DANGER';
  }) => void;
  isEditing?: boolean; // Nuevo prop para indicar si se está editando una zona existente
  editingZoneId?: string; // ID de la zona que se está editando
  isActivelyEditing?: boolean; // Prop para indicar si se está editando activamente (arrastrando puntos, etc.)
}

// Componente para mostrar el polígono en construcción
function DrawingPolygon({ coordinates, onPointDrag, zoneType, onPointDelete, isDrawing, isEditing }: {
  coordinates: [number, number][];
  onPointDrag: (index: number, newPosition: [number, number]) => void;
  zoneType?: 'SECURE' | 'RESTRICTED' | 'DANGER';
  onPointDelete?: (index: number) => void;
  isDrawing: boolean; // Para saber si se está dibujando
  isEditing?: boolean; // Para saber si se está editando una zona existente
}) {
  if (coordinates.length === 0) return null;

  // Función para obtener el color según el tipo de zona
  const getZoneColor = (type?: string) => {
    switch (type) {
      case 'SECURE':
        return '#22C55E'; // verde corporativo
      case 'RESTRICTED':
        return '#F59E0B'; // Amarillo
      case 'DANGER':
        return '#EF4444'; // Rojo
      default:
        return '#1559ED'; // Azul por defecto
    }
  };

  const zoneColor = getZoneColor(zoneType);

  return (
    <>
      {/* Si hay zoneType, mostrar polígono relleno */}
      {zoneType && coordinates.length >= 3 ? (
        <Polygon
          positions={coordinates}
          pathOptions={{
            color: zoneColor,
            weight: 3,
            opacity: 0.8,
            fillColor: zoneColor,
            fillOpacity: 0.3
          }}
        />
      ) : (
        <>
          {/* Línea que conecta los puntos (mostrar desde el primer punto) */}
          {coordinates.length >= 1 && (
            <Polyline
              positions={coordinates}
              pathOptions={{
                color: zoneColor,
                weight: 3,
                opacity: 0.8,
                dashArray: '5, 10'
              }}
            />
          )}

          {/* Línea que cierra el polígono (solo si hay 3 o más puntos) */}
          {coordinates.length >= 3 && (
            <Polyline
              positions={[coordinates[coordinates.length - 1], coordinates[0]]}
              pathOptions={{
                color: zoneColor,
                weight: 3,
                opacity: 0.8,
                dashArray: '3, 6'
              }}
            />
          )}
        </>
      )}

      {/* Marcadores arrastrables - Mostrar cuando se está dibujando O editando */}
      {(isDrawing || isEditing) && coordinates.map((coord, index) => (
        <Marker
          key={index}
          position={coord}
          draggable={true}
          icon={new L.Icon({
            iconUrl: '/leaflet/marker-icon.png',
            iconRetinaUrl: '/leaflet/marker-icon-2x.png',
            shadowUrl: '/leaflet/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
            className: 'custom-drawing-marker'
          })}
          eventHandlers={{
            dragstart: () => {
              console.log('🔄 Iniciando drag del marcador', index);
              isDraggingGlobal = true;
            },
            dragend: (e) => {
              console.log('✅ Terminando drag del marcador', index);
              const newPosition: [number, number] = [e.target.getLatLng().lat, e.target.getLatLng().lng];
              onPointDrag(index, newPosition);

              // Resetear la bandera después de un delay más largo
              setTimeout(() => {
                isDraggingGlobal = false;
                console.log('🔄 Bandera de drag reseteada');
              }, 500);
            },
            contextmenu: (e) => {
              // Prevenir menú contextual en marcadores
              e.originalEvent.preventDefault();
            },
            dblclick: (_e) => {
              // Doble clic para eliminar punto (solo si hay más de 3 puntos)
              if (onPointDelete && coordinates.length > 3) {
                onPointDelete(index);
              }
            }
          }}
        />
      ))}
    </>
  );
}

// Función para calcular el centro de un polígono
function calculatePolygonCenter(polygon: [number, number][]): [number, number] {
  if (polygon.length === 0) return [0, 0];

  let latSum = 0;
  let lngSum = 0;

  for (const [lat, lng] of polygon) {
    latSum += lat;
    lngSum += lng;
  }

  return [latSum / polygon.length, lngSum / polygon.length];
}

// Componente para mostrar zonas completadas
function CompletedZones({ zones, existingZones, onZoneSelect, isEditing, editingZoneId }: {
  zones: [number, number][][];
  existingZones?: Array<{
    id: string;
    name: string;
    polygon: [number, number][];
    type: 'SECURE' | 'RESTRICTED' | 'DANGER';
  }>;
  onZoneEdit?: (zone: {
    id: string;
    polygon: [number, number][];
    type: 'SECURE' | 'RESTRICTED' | 'DANGER';
  }) => void;
  onZoneSelect?: (zone: {
    id: string;
    polygon: [number, number][];
    type: 'SECURE' | 'RESTRICTED' | 'DANGER';
  }) => void;
  isEditing?: boolean;
  currentPolygon: [number, number][];
  editingZoneId?: string;
}) {
  // Función para obtener el color según el tipo de zona
  const getZoneColor = (type: string) => {
    switch (type) {
      case 'SECURE':
        return '#10B981'; // verde corporativo
      case 'RESTRICTED':
        return '#F59E0B'; // Amarillo
      case 'DANGER':
        return '#EF4444'; // Rojo
      default:
        return '#10B981'; // Verde por defecto
    }
  };

  return (
    <>
      {/* Zonas temporales (durante creación) */}
      {zones.map((zone, index) => (
        <Polyline
          key={`temp-zone-${index}`}
          positions={[...zone, zone[0]]} // Cerrar el polígono
          pathOptions={{
            color: '#10B981',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
            className: 'completed-zone'
          }}
        />
      ))}

      {/* Zonas existentes del backend con colores según tipo */}
      {existingZones?.map((zone) => {
        // No mostrar la zona que se está editando como zona estática
        if (isEditing && editingZoneId === zone.id) {
          return null;
        }

        // Calcular el centro del polígono para mostrar el nombre
        const center = calculatePolygonCenter(zone.polygon);

        return (
          <React.Fragment key={`existing-zone-${zone.id}`}>
            <Polygon
              positions={zone.polygon}
              pathOptions={{
                color: getZoneColor(zone.type),
                weight: 3,
                opacity: 0.8,
                fillColor: getZoneColor(zone.type),
                fillOpacity: 0.2,
                className: 'existing-zone'
              }}
              eventHandlers={{
                click: () => {
                  console.log('🗺️ Zona clickeada en el mapa:', zone.id);
                  if (onZoneSelect) {
                    onZoneSelect(zone);
                  }
                }
              }}
            />
            {/* Mostrar el nombre de la zona en el centro sin marcador visible */}
            <ZoneNameVisibility>
              <Marker position={center} icon={new L.DivIcon({
                html: '',
                className: 'invisible-marker',
                iconSize: [0, 0],
                iconAnchor: [0, 0]
              })}>
                <Tooltip
                  direction="center"
                  offset={[0, 0]}
                  opacity={1}
                  permanent={true}
                  className="zone-name-tooltip"
                  interactive={false}
                >
                  <div className="zone-name-text text-left font-semibold text-gray-800 px-2 py-1 rounded">
                    {zone.name}
                  </div>
                </Tooltip>
              </Marker>
            </ZoneNameVisibility>
          </React.Fragment>
        );
      })}
    </>
  );
}

// Componente para manejar la visibilidad de los nombres según el zoom
function ZoneNameVisibility({ children }: { children: React.ReactNode }) {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = React.useState(map.getZoom());
  const [showNames, setShowNames] = React.useState(currentZoom >= 12);

  React.useEffect(() => {
    const handleZoom = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      setShowNames(zoom >= 12);

      // Actualizar CSS custom properties para el tamaño dinámico
      const scale = Math.max(0.5, Math.min(2, (zoom - 8) / 4)); // Escala de 0.5 a 2 basada en zoom
      document.documentElement.style.setProperty('--zoom-scale', scale.toString());
    };

    map.on('zoom', handleZoom);
    map.on('zoomend', handleZoom);

    // Llamar una vez al montar
    handleZoom();

    return () => {
      map.off('zoom', handleZoom);
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  // CORRECCIÓN CRÍTICA: Usar opacity en lugar de conditional rendering
  // Esto evita que React desmonte los tooltips de Leaflet, lo que causaba
  // el error "removeChild: The node to be removed is not a child of this node"
  return (
    <div style={{
      opacity: showNames ? 1 : 0,
      pointerEvents: showNames ? 'auto' : 'none',
      transition: 'opacity 0.2s ease-in-out'
    }}>
      {children}
    </div>
  );
}

// Bandera global para prevenir clicks después de drag
let isDraggingGlobal = false;

// Componente interno del mapa que se renderiza solo en el cliente
function ZoneMapInternal({ onPolygonComplete, onPolygonChange, onPointDrag, onPointDelete, isDrawing, currentPolygon, completedZones = [], existingZones = [], center, zoneType, zoom, bounds, onZoneEdit, onZoneSelect, isEditing, editingZoneId, isActivelyEditing }: SimpleZoneMapProps) {


  // Función para manejar el arrastre de puntos
  const handlePointDrag = (index: number, newPosition: [number, number]) => {
    const newCoordinates = [...currentPolygon];
    newCoordinates[index] = newPosition;

    // Usar la función específica si está disponible, sino usar la genérica
    if (onPointDrag) {
      onPointDrag(index, newPosition);
    } else {
      onPolygonChange(newCoordinates);
    }
  };

  // Función para eliminar puntos
  const handlePointDelete = (index: number) => {
    if (currentPolygon.length > 3) {
      const newCoordinates = currentPolygon.filter((_, i) => i !== index);

      // Usar la función específica si está disponible, sino usar la genérica
      if (onPointDelete) {
        onPointDelete(index);
      } else {
        onPolygonChange(newCoordinates);
      }
    }
  };

  // Componente para manejar eventos del mapa
  const MapEvents = () => {
    useMapEvents({
      click: (e: any) => {
        console.log('🖱️ Click en el mapa:', { isDrawing, isEditing, currentPolygonLength: currentPolygon.length, isDraggingGlobal });

        // No agregar puntos si se está arrastrando
        if (isDraggingGlobal) {
          console.log('❌ Ignorando click después de drag');
          return;
        }

        if (isDrawing || isEditing) {
          const newCoord: [number, number] = [e.latlng.lat, e.latlng.lng];
          console.log('📍 Nueva coordenada:', newCoord);

          // Si ya hay puntos y el nuevo punto está cerca del primer punto, cerrar el polígono
          if (currentPolygon.length >= 2) {
            const firstPoint = currentPolygon[0];
            const distance = calculateDistance(newCoord, firstPoint);

            // Si está a menos de 0.001 grados (aproximadamente 100 metros), cerrar el polígono
            if (distance < 0.001) {
              console.log('🔒 Cerrando polígono automáticamente');
              onPolygonComplete(currentPolygon);
              return;
            }
          }

          const newCoords = [...currentPolygon, newCoord];
          console.log('📝 Actualizando polígono:', newCoords);
          onPolygonChange(newCoords);
        } else {
          console.log('❌ Modo de dibujo no activo');
        }
      },
      dblclick: (_e: any) => {
        console.log('🖱️🖱️ Doble click en el mapa:', { isDrawing, isEditing, currentPolygonLength: currentPolygon.length });
        if ((isDrawing || isEditing) && currentPolygon.length >= 3) {
          // Doble clic para finalizar el polígono
          console.log('🔒 Finalizando polígono con doble click');
          onPolygonComplete(currentPolygon);
        }
      },
      contextmenu: (e: any) => {
        // Prevenir el menú contextual del navegador
        e.originalEvent.preventDefault();
      }
    });

    return null; // No renderiza nada visual, solo maneja eventos
  };

  // Componente para manejar bounds del mapa
  const MapBounds = () => {
    const map = useMap();

    React.useEffect(() => {
      if (bounds && map && !isActivelyEditing) {
        // Solo aplicar bounds si no se está editando activamente para evitar redireccionamiento automático
        map.fitBounds(bounds, {
          padding: [20, 20], // Margen de 20px en todos los lados
          maxZoom: 16, // Zoom máximo para evitar acercarse demasiado
          animate: true // Animación suave
        });
      }
    }, [bounds, map, isActivelyEditing]);

    return null; // No renderiza nada visual, solo maneja bounds
  };

  // Función helper para calcular distancia entre dos puntos
  const calculateDistance = (point1: [number, number], point2: [number, number]) => {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) +
      Math.pow(point1[1] - point2[1], 2)
    );
  };

  return (
    <MapContainer
      center={center || [-1.8312, -78.1834] as [number, number]}
      zoom={zoom || 7}
      minZoom={6}
      maxZoom={18}
      zoomControl={false}
      attributionControl={false}
      className={`h-full w-full ${isDrawing ? 'drawing-mode' : ''}`}
      // Asegurar que no se muestren marcadores por defecto
      markerZoomAnimation={false}
      key={`${center?.[0]}-${center?.[1]}-${zoom}`}
      ref={(map) => {
        if (map) {
          setTimeout(() => {
            map.invalidateSize();
          }, 200);
        }
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={18}
        minZoom={6}
        maxNativeZoom={18}
        tileSize={256}
        zoomOffset={0}
        updateWhenZooming={true}
        keepBuffer={2}
        updateWhenIdle={false}
        noWrap={false}
        bounds={undefined}
        className="map-tiles"
      />

      {/* Componente para manejar eventos del mapa */}
      <MapEvents />


      {/* Componente para manejar bounds del mapa */}
      <MapBounds />

      {/* Mostrar zonas completadas */}
      <CompletedZones
        zones={completedZones}
        existingZones={existingZones}
        onZoneEdit={onZoneEdit}
        onZoneSelect={onZoneSelect}
        isEditing={isEditing}
        currentPolygon={currentPolygon}
        editingZoneId={editingZoneId}
      />

      {/* Mostrar polígono en construcción o en edición */}
      {(isDrawing || isEditing) && currentPolygon.length > 0 && (
        <DrawingPolygon
          coordinates={currentPolygon}
          onPointDrag={handlePointDrag}
          zoneType={zoneType}
          onPointDelete={handlePointDelete}
          isDrawing={isDrawing}
          isEditing={isEditing}
        />
      )}
    </MapContainer>
  );
}

// Componente wrapper que se carga dinámicamente para evitar problemas de SSR
const SimpleZoneMap = ZoneMapInternal;

export default SimpleZoneMap;