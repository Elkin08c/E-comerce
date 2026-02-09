'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SimpleZoneMap from './SimpleZoneMap';
import ZoneForm from './ZoneForm';
import CreatedZones from './CreatedZones';
import ZoneDetails from './ZoneDetails';
import PointsCounter from './PointsCounter';
import { type CreateZoneDto, type Zone } from '../../services';
import { useGeocoding } from '../../hooks/useGeocoding';
import { useGeographic } from '../../hooks/useGeographic';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import ZoneAlertModal from '@/components/ui/zone-alert-modal';
import { useZones } from '../../contexts/ZonesContext';
import MapPinIcon from '../../ui/MapPinIcon';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';

export default function ZoneMap() {
  const navigate = useNavigate();
  const { zones, loading: isLoading, loadZones, createZone: createZoneAPI, updateZone: updateZoneAPI, deleteZone: deleteZoneAPI } = useZones();
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][]>([]);

  // Hook para el modal de confirmación
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  // Estado para el modal de alerta de zona
  const [zoneAlertModal, setZoneAlertModal] = useState<{
    isOpen: boolean;
    zoneType: 'DANGER' | 'RESTRICTED' | null;
    zoneName: string;
  }>({
    isOpen: false,
    zoneType: null,
    zoneName: ''
  });
  const [isDrawing, setIsDrawing] = useState(false);

  // Pre-cargar datos geográficos de Apollo ANTES de usar geocoding
  // Esto previene el error "Too Many Requests" al evitar peticiones HTTP directas
  const { provinces, cities, loading: geoDataLoading } = useGeographic();

  // Hook de geocoding para llenado automático
  // IMPORTANTE: Este hook usa los datos de useGeographic() internamente
  const { getLocationInfoFromCoordinates } = useGeocoding();

  const [showForm, setShowForm] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [isActivelyEditing, setIsActivelyEditing] = useState(false);

  useEffect(() => {
    if (isActivelyEditing && !isEditingZone) {
      setIsActivelyEditing(false);
    }
  }, [isActivelyEditing, isEditingZone]);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [completedZones, setCompletedZones] = useState<[number, number][][]>([]);
  const [, setSelectedCity] = useState<any>(null);
  const [, setSelectedProvince] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.8312, -78.1834]);
  const [currentZoneType, setCurrentZoneType] = useState<'SECURE' | 'RESTRICTED' | 'DANGER'>('SECURE');
  const [mapZoom] = useState<number>(7);
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | undefined>(undefined);
  const [autoDetectedLocation, setAutoDetectedLocation] = useState<{
    province?: { id: string; name: string };
    city?: { id: string; name: string };
  } | null>(null);

  const [polygonHistory, setPolygonHistory] = useState<[number, number][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUpdatingFromHistory, setIsUpdatingFromHistory] = useState(false);

  // Cargar zonas cuando el componente se monta
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Función para llenar automáticamente el formulario con información de ubicación
  const autoFillLocationForm = useCallback(async (polygon: [number, number][]) => {
    if (polygon.length < 3) return;

    // Verificar que los datos geográficos estén cargados
    if (geoDataLoading) {
      console.log('⏳ Esperando a que los datos geográficos terminen de cargar...');
      return;
    }

    if (!provinces.length || !cities.length) {
      console.warn('⚠️ Los datos geográficos de Apollo no están disponibles. Esperando...');
      return;
    }

    console.log('✅ Datos geográficos disponibles:', {
      provinces: provinces.length,
      cities: cities.length,
    });

    try {
      // Calcular el centro del polígono
      const [centerLat, centerLng] = calculatePolygonCenter(polygon);

      console.log(`🔍 Obteniendo información de ubicación para centro: [${centerLat}, ${centerLng}]`);

      // Obtener información de ubicación
      const locationInfo = await getLocationInfoFromCoordinates(centerLat, centerLng);
      
      if (locationInfo.province || locationInfo.city) {
        console.log('✅ Información de ubicación obtenida:', locationInfo);
        
        // Guardar la información automática detectada (convertir null a undefined)
        setAutoDetectedLocation({
          province: locationInfo.province ?? undefined,
          city: locationInfo.city ?? undefined,
        });
        
        // Actualizar los estados para llenar el formulario
        if (locationInfo.province) {
          setSelectedProvince({ id: locationInfo.province.id, name: locationInfo.province.name });
        }
        if (locationInfo.city) {
          setSelectedCity({ id: locationInfo.city.id, name: locationInfo.city.name });
        }
      } else {
        console.log('⚠️ No se pudo obtener información de ubicación automáticamente');
        setAutoDetectedLocation(null);
      }
    } catch (error) {
      console.error('Error llenando formulario automáticamente:', error);
    }
    // NOTE: No incluimos provinces, cities en las dependencias
    // porque se recrean en cada render desde Apollo, causando infinite loop (React error #185).
    // Solo los usamos para verificación, no necesitamos que el callback se recree cuando cambien.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getLocationInfoFromCoordinates, geoDataLoading]);

  const handlePolygonComplete = useCallback((coordinates: [number, number][]) => {
    setCurrentPolygon(coordinates);
    // NO mostrar el formulario automáticamente, solo guardar el polígono
    // El formulario se mostrará cuando el usuario presione "Finalizar Zona"
  }, []);

  const handlePolygonChange = useCallback((coordinates: [number, number][]) => {
    console.log('🔄 handlePolygonChange llamado:', {
      coordinates: coordinates.length,
      isEditingZone,
      selectedZone: !!selectedZone,
      isUpdatingFromHistory,
      currentHistoryIndex: historyIndex,
      currentHistoryLength: polygonHistory.length
    });
    
    setCurrentPolygon(coordinates);
    
    // Si estamos editando una zona y NO estamos actualizando desde el historial, guardar en el historial
    if (isEditingZone && selectedZone && !isUpdatingFromHistory) {
      saveToHistory(coordinates);
    } else {
    }
  }, [isEditingZone, selectedZone, isUpdatingFromHistory, historyIndex, polygonHistory.length]);

  const handleZoneSave = async (zoneData: CreateZoneDto) => {
    try {
      // Calcular área del polígono
      const polygon = zoneData.polygon || [];
      const areaKm2 = calculatePolygonArea(polygon);

      // Crear un array completamente nuevo con el tipo correcto
      const finalPolygon: [number, number][] = [];
      for (let i = 0; i < polygon.length; i++) {
        const coord = polygon[i];
        if (Array.isArray(coord) && coord.length === 2) {
          finalPolygon.push([Number(coord[0]), Number(coord[1])]);
        } else {
          throw new Error(`Formato de coordenada inválido en índice ${i}`);
        }
      }


      const zoneToCreate = {
        name: zoneData.name,
        description: zoneData.description,
        cityId: zoneData.cityId,
        polygon: finalPolygon,
        type: zoneData.type,
        areaKm2,
        ...(zoneData.shippingPrice && { shippingPrice: zoneData.shippingPrice }),
        ...(zoneData.transportCompanyId && { transportCompanyId: zoneData.transportCompanyId })
      };

      console.log('🔍 Frontend - zoneData recibido:', JSON.stringify(zoneData, null, 2));
      console.log('🔍 Frontend - zoneToCreate construido:', JSON.stringify(zoneToCreate, null, 2));

      if (selectedZone) {
        console.log('📝 Actualizando zona con ID:', selectedZone.id);
        await updateZoneAPI(selectedZone.id, zoneToCreate);
        console.log('✅ Zona actualizada');
      } else {
        setCompletedZones(prev => [...prev, polygon]);
        console.log('➕ Creando nueva zona');
        await createZoneAPI(zoneToCreate);
        console.log('✅ Zona creada');
      }
      setCurrentPolygon([]);
      setCompletedZones([]); // Limpiar zonas temporales
      setShowForm(false);
      setSelectedZone(null);
      setIsDrawing(false);
      setIsEditingZone(false);
      setIsActivelyEditing(false);
      setError(null);
      setAutoDetectedLocation(null);

      // Limpiar historial
      setPolygonHistory([]);
      setHistoryIndex(-1);
      setIsUpdatingFromHistory(false);

      // Mostrar mensaje de éxito
      const message = selectedZone ? '¡Zona actualizada exitosamente!' : '¡Zona creada exitosamente!';
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Si es nueva zona DANGER o RESTRICTED, mostrar modal de alerta
      if (!selectedZone && (zoneData.type === 'DANGER' || zoneData.type === 'RESTRICTED')) {
        setTimeout(() => {
          setZoneAlertModal({
            isOpen: true,
            zoneType: zoneData.type as 'DANGER' | 'RESTRICTED',
            zoneName: zoneData.name
          });
        }, 1000); // Esperar 1 segundo para que el usuario vea el mensaje de éxito primero
      }
    } catch (error) {
      console.error('Error guardando zona:', error);
      setError('Error guardando zona');
      if (!selectedZone) {
        setCompletedZones(prev => prev.slice(0, -1));
      }
    }
  };

  const handleZoneDelete = async (zoneId: string) => {
    const confirmed = await showConfirmation({
      title: 'Eliminar Zona',
      message: '¿Estás seguro de que quieres eliminar esta zona? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteZoneAPI(zoneId);

      if (selectedZone?.id === zoneId) {
        setSelectedZone(null);
        setShowForm(false);
        setIsDrawing(false);
        setIsEditingZone(false);
        setCurrentPolygon([]);
        setAutoDetectedLocation(null);
      }

      setError(null);
      setSuccessMessage('Zona eliminada exitosamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error eliminando zona:', error);
      setError('Error eliminando zona');
    } finally {
      hideConfirmation();
    }
  };

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    setCurrentPolygon(zone.polygon || []);
    setIsDrawing(false); // NO activar modo de dibujo al seleccionar, solo mostrar la zona
    setIsEditingZone(false); // NO activar modo de edición al seleccionar
    
    // Si estaba editando otra zona, cerrar el formulario
    if (showForm) {
      setShowForm(false);
      setAutoDetectedLocation(null);
    }
    
    // Hacer zoom a la zona seleccionada
    if (zone.polygon && zone.polygon.length > 0) {
      zoomToZone(zone.polygon);
    }
  };

  // Función para manejar la selección de zona desde el mapa (solo con id, polygon, type)
  const handleZoneSelectFromMap = (zoneData: { id: string; polygon: [number, number][]; type: 'SECURE' | 'RESTRICTED' | 'DANGER' }) => {
    // Buscar la zona completa en el estado
    const fullZone = zones.find(z => z.id === zoneData.id);
    if (fullZone) {
      console.log('🗺️ Zona seleccionada desde el mapa:', fullZone.name);
      
      // Si estaba editando otra zona, cerrar el formulario
      if (showForm && selectedZone?.id !== zoneData.id) {
        setShowForm(false);
        setAutoDetectedLocation(null);
        setIsEditingZone(false);
      }
      
      handleZoneSelect(fullZone);
      
      // Navegar a la página correcta en la lista de zonas
      if ((window as any).navigateToZonePage) {
        (window as any).navigateToZonePage(zoneData.id);
      }
    }
  };

  // Función específica para navegar a una zona en la lista (solo recibe zoneId)
  const handleNavigateToZone = (zoneId: string) => {
    if ((window as any).navigateToZonePage) {
      (window as any).navigateToZonePage(zoneId);
    }
  };

  const handleZoneEdit = async (zone: Zone | {
    id: string;
    polygon: [number, number][];
    type: 'SECURE' | 'RESTRICTED' | 'DANGER';
  }) => {
    // Buscar la zona completa en el estado o usar la provista
    const fullZone = 'name' in zone ? zone : zones.find(z => z.id === zone.id);
    if (fullZone) {
      setSelectedZone(fullZone);
      setCurrentPolygon(zone.polygon || []);
      setCurrentZoneType(zone.type);
      setShowForm(true);
      setIsDrawing(false); // NO activar modo de dibujo, solo modo de edición
      setIsEditingZone(true); // Activar el estado de edición

      // Configurar la información de ubicación de la zona existente
      if (fullZone.city) {
        setSelectedCity({ id: fullZone.city.id, name: fullZone.city.name });
      }
          
      // Inicializar historial con estados progresivos del polígono original
      // Crear historial que permita deshacer punto por punto
      const zonePolygon = zone.polygon || [];
      const originalPolygon = [...zonePolygon];
      const progressiveHistory: [number, number][][] = [];

      // Agregar estados progresivos: vacío, punto1, punto1+2, punto1+2+3, etc.
      progressiveHistory.push([]); // Estado vacío
      for (let i = 1; i <= originalPolygon.length; i++) {
        progressiveHistory.push(originalPolygon.slice(0, i));
      }

      setPolygonHistory(progressiveHistory);
      setHistoryIndex(progressiveHistory.length - 1); // Empezar en el estado completo

      console.log('🎯 Iniciando edición de zona:', {
        zoneId: zone.id,
        originalPolygon: zonePolygon.length,
        historyInitialized: true
      });

      // Hacer zoom inicial a la zona cuando se inicia la edición desde la lista
      zoomToZone(zonePolygon);
    }
  };

  const startDrawing = () => {
    // Iniciando modo de dibujo
    
    // Limpiar todos los estados de edición
    setIsEditingZone(false);
    setPolygonHistory([]);
    setHistoryIndex(-1);
    setIsUpdatingFromHistory(false);
    
    // Limpiar estados de dibujo y zona
    setIsDrawing(true);
    setCurrentPolygon([]);
    setShowForm(false);
    setSelectedZone(null);
    setAutoDetectedLocation(null);
    setMapBounds(undefined);
    setCompletedZones([]);
    
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
    setShowForm(false);
    setSelectedZone(null);
    setIsEditingZone(false); // Resetear también el estado de edición
    setAutoDetectedLocation(null); // Limpiar información automática
    setMapBounds(undefined); // Limpiar bounds
  };

  const handleFormCancel = () => {
    // Cancelar el formulario y la edición del polígono
    setShowForm(false);
    setSelectedZone(null);
    setIsDrawing(false);
    setIsEditingZone(false);
    setIsActivelyEditing(false);
    setCurrentPolygon([]);
    setAutoDetectedLocation(null);
    
    // Limpiar historial
    setPolygonHistory([]);
    setHistoryIndex(-1);
    setIsUpdatingFromHistory(false);
  };

  const handleRecalculateLocation = async () => {
    if (currentPolygon.length >= 3) {
      await autoFillLocationForm(currentPolygon);
    }
  };

  const handleEditLocationManually = () => {
    // La lógica se maneja en el componente ZoneForm
  };

  // Función para guardar el estado actual en el historial
  const saveToHistory = (polygon: [number, number][]) => {
    // Solo guardar si el polígono es diferente al último estado guardado
    const lastState = polygonHistory[historyIndex];
    const isDifferent = !lastState || JSON.stringify(lastState) !== JSON.stringify(polygon);
    
    console.log('🔍 Guardando en historial:', {
      isDifferent,
      lastState: lastState?.length,
      newPolygon: polygon.length,
      historyIndex,
      totalHistory: polygonHistory.length
    });
    
    if (isDifferent) {
      // Agregar el nuevo estado después del índice actual
      const newHistory = polygonHistory.slice(0, historyIndex + 1);
      newHistory.push([...polygon]);
      setPolygonHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      console.log('✅ Historial actualizado:', newHistory.length, 'estados, nuevo índice:', newHistory.length - 1);
    }
  };

  // Función para deshacer cambios
  const undoLastChange = () => {
    console.log('🔙 Deshacer - Estado actual:', {
      historyIndex,
      totalHistory: polygonHistory.length,
      canUndo: historyIndex > 0
    });
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      // Marcar que estamos actualizando desde el historial para evitar guardar en el historial
      setIsUpdatingFromHistory(true);
      setCurrentPolygon([...polygonHistory[newIndex]]);
      
      // Resetear la bandera después de un breve delay
      setTimeout(() => {
        setIsUpdatingFromHistory(false);
      }, 100);
      
      console.log('✅ Deshacer ejecutado, nuevo índice:', newIndex, 'puntos:', polygonHistory[newIndex].length);
    }
  };

  // Función para rehacer cambios
  const redoLastChange = () => {
    console.log('🔄 Rehacer - Estado actual:', {
      historyIndex,
      totalHistory: polygonHistory.length,
      canRedo: historyIndex < polygonHistory.length - 1
    });
    
    if (historyIndex < polygonHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      // Marcar que estamos actualizando desde el historial para evitar guardar en el historial
      setIsUpdatingFromHistory(true);
      setCurrentPolygon([...polygonHistory[newIndex]]);
      
      // Resetear la bandera después de un breve delay
      setTimeout(() => {
        setIsUpdatingFromHistory(false);
      }, 100);
      
      console.log('✅ Rehacer ejecutado, nuevo índice:', newIndex, 'puntos:', polygonHistory[newIndex].length);
    }
  };

  // Función para deshacer el último punto (solo para creación)
  const undoLastPoint = () => {
    if (currentPolygon.length > 0) {
      const newPolygon = currentPolygon.slice(0, -1);
      setCurrentPolygon(newPolygon);
      saveToHistory(newPolygon);
    }
  };

  // Función para manejar el arrastre de puntos
  const handlePointDrag = (index: number, newPosition: [number, number]) => {
    console.log('🎯 handlePointDrag llamado:', {
      index,
      newPosition,
      currentPolygon: currentPolygon.length,
      isEditingZone,
      selectedZone: !!selectedZone
    });
    
    // Activar estado de edición activa para evitar zoom automático
    setIsActivelyEditing(true);
    
    const newPolygon = [...currentPolygon];
    newPolygon[index] = newPosition;
    handlePolygonChange(newPolygon);
  };

  // Función para manejar la eliminación de puntos
  const handlePointDelete = (index: number) => {
    console.log('🗑️ handlePointDelete llamado:', {
      index,
      currentPolygon: currentPolygon.length,
      isEditingZone,
      selectedZone: !!selectedZone
    });
    
    // Activar estado de edición activa para evitar zoom automático
    setIsActivelyEditing(true);
    
    if (currentPolygon.length > 3) {
      const newPolygon = currentPolygon.filter((_, i) => i !== index);
      handlePolygonChange(newPolygon);
    }
  };

  const calculatePolygonArea = (polygon: [number, number][]): number => {
    if (polygon.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      area += polygon[i][0] * polygon[j][1];
      area -= polygon[j][0] * polygon[i][1];
    }
    area = Math.abs(area) / 2;
    
    // Convertir a km² (aproximado)
    return parseFloat((area * 111 * 111).toFixed(2));
  };

  // Función para hacer zoom a una zona específica usando bounds precisos
  const zoomToZone = (polygon: [number, number][]) => {
    if (polygon.length < 3) return;
    
    // Calcular el centro de la zona
    let centerLat = 0;
    let centerLng = 0;
    
    polygon.forEach(([lat, lng]) => {
      centerLat += lat;
      centerLng += lng;
    });
    
    centerLat /= polygon.length;
    centerLng /= polygon.length;
    
    // Calcular los bounds exactos de la zona
    const bounds = polygon.reduce(
      (acc, [lat, lng]) => {
        acc.minLat = Math.min(acc.minLat, lat);
        acc.maxLat = Math.max(acc.maxLat, lat);
        acc.minLng = Math.min(acc.minLng, lng);
        acc.maxLng = Math.max(acc.maxLng, lng);
        return acc;
      },
      { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
    );
    
    // Agregar un pequeño margen para que la zona no esté pegada al borde
    const margin = 0.001; // Aproximadamente 100 metros
    bounds.minLat -= margin;
    bounds.maxLat += margin;
    bounds.minLng -= margin;
    bounds.maxLng += margin;
    
    // Usar bounds para un zoom más preciso
    const newBounds: [[number, number], [number, number]] = [
      [bounds.minLat, bounds.minLng],
      [bounds.maxLat, bounds.maxLng]
    ];
    
    // Aplicar los bounds (esto hará zoom automáticamente)
    setMapBounds(newBounds);
    
    // También actualizar el centro como fallback
    setMapCenter([centerLat, centerLng]);
  };

  // Función para calcular el centro de un polígono
  const calculatePolygonCenter = (polygon: [number, number][]): [number, number] => {
    if (polygon.length === 0) return [0, 0];
    
    let centerLat = 0;
    let centerLng = 0;
    
    polygon.forEach(([lat, lng]) => {
      centerLat += lat;
      centerLng += lng;
    });
    
    return [centerLat / polygon.length, centerLng / polygon.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold text-[#1559ED] mb-2">
          Gestión de Zonas
        </h1>
        <p className="text-gray-600">
          Crea y gestiona zonas geográficas en el mapa del Ecuador
        </p>
      </div>

      {/* Mapa y Formulario - Layout lado a lado cuando hay formulario */}
      <div className={`grid gap-6 ${showForm ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Mapa - Ocupa 2/3 cuando hay formulario, todo el ancho cuando no */}
        <div className={showForm ? 'lg:col-span-2' : 'w-full' }> 
        
          <Card className="rounded-lg bg-white">
            <CardHeader className="py-2 pt-5 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 ">
                <MapPinIcon size={24} className="w-4.25 h-6 shrink-0"  />
                <span className="text-[#1559ED] font-['Poppins'] text-[36px] font-semibold leading-normal" >
                  Mapa de Zonas - Ecuador
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Controles de dibujo ARRIBA del mapa - Mostrar cuando se dibuja O cuando se edita */}
              {(isDrawing || (selectedZone && showForm)) && (
                <div className="px-8 py-3">
                  <div className="flex gap-4 items-center">
                    {/* Botón Finalizar Zona - Solo mostrar cuando se está creando una nueva zona y no se ha abierto el formulario */}
                    {isDrawing && !selectedZone && !showForm && (
                      <Button
                        onClick={async () => {
                          setCurrentPolygon(currentPolygon);
                          setShowForm(true);
                          // Llenar automáticamente el formulario cuando se presiona "Finalizar Zona"
                          await autoFillLocationForm(currentPolygon);
                        }}
                        className="bg-[#FE9124] hover:bg-[#FE9124]/90 text-white"
                        disabled={currentPolygon.length < 3 || isLoading}
                      >
                        Finalizar Zona
                      </Button>
                    )}
                    
                    {/* Botón para volver a editar si ya se mostró el formulario - Solo en creación */}
                    {/* Removido: Botón "Editar Zona" - Los puntos se pueden mover en tiempo real */}
                  
                  
                    
                    {/* Controles diferentes para creación vs edición */}
                    {isEditingZone ? (
                      // Controles para edición: Deshacer y Rehacer
                      <>
                        {console.log('🔍 Renderizando botones de edición:', {
                          historyIndex,
                          polygonHistoryLength: polygonHistory.length,
                          undoDisabled: historyIndex <= 0,
                          redoDisabled: historyIndex >= polygonHistory.length - 1
                        })}
                        <Button
                          onClick={() => {
                            console.log('🔙 Botón Deshacer clickeado:', {
                              historyIndex,
                              polygonHistoryLength: polygonHistory.length,
                              disabled: historyIndex <= 0
                            });
                            undoLastChange();
                          }}
                          variant="outline"
                          disabled={historyIndex <= 0}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                        >
                          Deshacer
                        </Button>
                        
                        <Button
                          onClick={() => {
                            console.log('🔄 Botón Rehacer clickeado:', {
                              historyIndex,
                              polygonHistoryLength: polygonHistory.length,
                              disabled: historyIndex >= polygonHistory.length - 1
                            });
                            redoLastChange();
                          }}
                          variant="outline"
                          disabled={historyIndex >= polygonHistory.length - 1}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                        >
                          Rehacer
                        </Button>
                      </>
                    ) : (
                      // Controles para creación: Cancelar y Deshacer punto
                      <>
                        <Button
                          onClick={cancelDrawing}
                          variant="outline"
                          className="bg-[#B5B5B5] hover:bg-[#B5B5B5]/90 text-white"
                        >
                          Cancelar
                        </Button>
                        
                        <Button
                          onClick={undoLastPoint}
                          variant="ghost"
                          disabled={currentPolygon.length === 0}
                          color='black'
                        >
                          Deshacer
                        </Button>
                      </>
                    )}
                    
                    {/* Contador de puntos al lado de los botones */}
                    <PointsCounter 
                      currentPoints={currentPolygon.length} 
                      minPoints={3} 
                    />
                  </div>
                </div>
              )}

              {/* Mapa */}
              <div className="map-container rounded-b-lg">
                <div className="w-full h-109 overflow-hidden ">
                  <SimpleZoneMap 
                    onPolygonComplete={handlePolygonComplete}
                    onPolygonChange={handlePolygonChange}
                    onPointDrag={handlePointDrag}
                    onPointDelete={handlePointDelete}
                    isDrawing={isDrawing}
                    currentPolygon={currentPolygon}
                    completedZones={completedZones}
                    existingZones={zones.map(zone => ({
                      id: zone.id,
                      name: zone.name,
                      polygon: zone.polygon || [],
                      type: zone.type
                    }))}
                    center={mapCenter}
                    zoneType={(() => {
                      // Si se está editando una zona, usar currentZoneType para cambios en tiempo real
                      if (isEditingZone && selectedZone) {
                        return currentZoneType;
                      }
                      // Si hay una zona seleccionada (sin editar), usar su type original
                      if (selectedZone && !isEditingZone) {
                        return selectedZone.type;
                      }
                      // Si se está creando una nueva zona, usar currentZoneType
                      if (showForm && !selectedZone) {
                        return currentZoneType;
                      }
                      // Si no hay zona seleccionada ni formulario, no mostrar zoneType
                      return undefined;
                    })()}
                    zoom={mapZoom}
                    bounds={mapBounds}
                    onZoneEdit={handleZoneEdit}
                    onZoneSelect={handleZoneSelectFromMap}
                    isEditing={isEditingZone}
                    editingZoneId={selectedZone?.id}
                    isActivelyEditing={isActivelyEditing} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario - Solo se muestra a la derecha cuando hay formulario */}
        {showForm && (
          <div className="lg:col-span-1">
            <ZoneForm
              zone={selectedZone}
              polygon={currentPolygon}
              onSave={handleZoneSave}
              onCancel={handleFormCancel}
              isEditing={!!selectedZone}
              onZoneTypeChange={setCurrentZoneType}
              autoDetectedLocation={autoDetectedLocation || undefined}
              onRecalculateLocation={handleRecalculateLocation}
              onEditLocationManually={handleEditLocationManually}
            />
          </div>
        )}
      </div>

      {/* Paneles informativos debajo del mapa - Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo */}
        <div className="space-y-6">
          {/* Zonas creadas */}
          <CreatedZones
            zones={zones}
            selectedZoneId={selectedZone?.id || null}
            onZoneSelect={handleZoneSelect}
            onZoneDelete={handleZoneDelete}
            onZoneEdit={handleZoneEdit}
            navigateToZone={handleNavigateToZone}
          />
        </div>

        {/* Panel derecho */}
        <div className="space-y-6">
          {/* Detalles de la zona */}
          <ZoneDetails zone={selectedZone} />
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-white hover:text-white/80"
            onClick={() => setError(null)}
          >
            ×
          </Button>
        </div>
      )}

      {/* Mensajes de éxito */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-[#1559ED] text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMessage}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-white hover:text-white/80"
            onClick={() => setSuccessMessage(null)}
          >
            ×
          </Button>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
        isLoading={modalState.isLoading}
      />

      {/* Modal de alerta post-creación */}
      {zoneAlertModal.zoneType && (
        <ZoneAlertModal
          isOpen={zoneAlertModal.isOpen}
          zoneType={zoneAlertModal.zoneType}
          zoneName={zoneAlertModal.zoneName}
          onClose={() => setZoneAlertModal({ isOpen: false, zoneType: null, zoneName: '' })}
          onAction={() => {
            // Cerrar el modal
            setZoneAlertModal({ isOpen: false, zoneType: null, zoneName: '' });
            // Navegar a Meeting Points para zonas DANGER
            if (zoneAlertModal.zoneType === 'DANGER') {
              navigate('/meeting-points');
            }
          }}
        />
      )}
    </div>
  );
}