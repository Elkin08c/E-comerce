'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

interface DrawingPolygonProps {
  onPolygonComplete: (coordinates: [number, number][]) => void;
  onPolygonChange: (coordinates: [number, number][]) => void;
  isDrawing: boolean;
  currentPolygon: [number, number][];
}

export default function DrawingPolygon({ 
  onPolygonComplete, 
  onPolygonChange, 
  isDrawing, 
  currentPolygon 
}: DrawingPolygonProps) {
  const map = useMap();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const currentPolygonRef = useRef<L.Polygon | null>(null);
  const [isControlActive, setIsControlActive] = useState(false); 

  useEffect(() => {
    if (!map) return;

    // Crear grupo para los elementos dibujados
    drawnItemsRef.current = new L.FeatureGroup();
    map.addLayer(drawnItemsRef.current);

    // Configurar controles de dibujo
    drawControlRef.current = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> El polígono no puede intersectarse consigo mismo'
          },
          shapeOptions: {
            color: '#10B981',
            weight: 2,
            fillOpacity: 0.2
          }
        },
        polyline: false,
        circle: false,
        circlemarker: false,
        rectangle: false,
        marker: false
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true
      }
    });

    map.addControl(drawControlRef.current);

    // Eventos de dibujo
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItemsRef.current?.addLayer(layer);

      if (layer instanceof L.Polygon) {
        const coordinates = layer.getLatLngs()[0] as L.LatLng[];
        const coords: [number, number][] = coordinates.map(latLng => [
          latLng.lat,
          latLng.lng
        ]);
        
        onPolygonComplete(coords);
        currentPolygonRef.current = layer;
      }
    });

    map.on(L.Draw.Event.EDITED, (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
          const coordinates = layer.getLatLngs()[0] as L.LatLng[];
          const coords: [number, number][] = coordinates.map(latLng => [
            latLng.lat,
            latLng.lng
          ]);
          
          onPolygonChange(coords);
        }
      });
    });

    map.on(L.Draw.Event.DELETED, () => {
      onPolygonChange([]);
      currentPolygonRef.current = null;
    });

    return () => {
      try {
        // Protección: Verificar que los elementos existan antes de removerlos
        if (drawControlRef.current && map && (map as any)._controlContainer) {
          map.removeControl(drawControlRef.current);
        }
        if (drawnItemsRef.current && map && map.hasLayer && map.hasLayer(drawnItemsRef.current)) {
          map.removeLayer(drawnItemsRef.current);
        }
      } catch (error) {
        console.warn('Error during DrawingPolygon cleanup:', error);
      }
    };
  }, [map, onPolygonComplete, onPolygonChange]);

  // Actualizar polígono actual cuando cambie
  useEffect(() => {
    if (!map || !drawnItemsRef.current) return;

    // Limpiar polígonos existentes con protección
    try {
      if (drawnItemsRef.current && drawnItemsRef.current.clearLayers) {
        drawnItemsRef.current.clearLayers();
      }
    } catch (error) {
      console.warn('Error clearing layers:', error);
    }

    // Dibujar polígono actual si existe
    if (currentPolygon.length >= 3) {
      const latLngs = currentPolygon.map(coord => new L.LatLng(coord[0], coord[1]));
      const polygon = new L.Polygon(latLngs, {
        color: '#10B981',
        weight: 2,
        fillOpacity: 0.2
      });
      
      drawnItemsRef.current.addLayer(polygon);
      currentPolygonRef.current = polygon;
    }
  }, [currentPolygon, map]);

  // Habilitar/deshabilitar controles de dibujo
  useEffect(() => {
    if (!map || !drawControlRef.current) return;

    try {
      if (isDrawing && !isControlActive) {
        // Agregar control si no está activo
        if ((map as any)._controlContainer) {
          map.addControl(drawControlRef.current);
          setIsControlActive(true);
        }
      } else if (!isDrawing && isControlActive) {
        // Remover control si está activo
        if ((map as any)._controlContainer) {
          map.removeControl(drawControlRef.current);
          setIsControlActive(false);
        }
      }
    } catch (error) {
      console.warn('Error toggling drawing controls:', error);
    }
  }, [isDrawing, map, isControlActive]);

  return null; // Este componente no renderiza nada visualmente
}