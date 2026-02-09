// Configuración del mapa y utilidades geográficas

export const mapConfig = {
  // Centro del mapa (Ecuador)
  ECUADOR_CENTER: [-1.8312, -78.1834] as [number, number],
  
  // Zoom por defecto
  DEFAULT_ZOOM: 7,
  
  // Límites de zoom
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  
  // Límites geográficos de Ecuador
  ECUADOR_BOUNDS: [
    [-5.015, -81.419], // Suroeste
    [1.469, -75.192]   // Noreste
  ] as [[number, number], [number, number]],
  
  // Ciudades principales de Ecuador
  ECUADOR_CITIES: [
    {
      name: 'Quito',
      coordinates: [-0.2299, -78.5249] as [number, number],
      description: 'Capital de Ecuador'
    },
    {
      name: 'Guayaquil',
      coordinates: [-2.1908, -79.8877] as [number, number],
      description: 'Puerto principal'
    },
    {
      name: 'Cuenca',
      coordinates: [-2.9006, -79.0045] as [number, number],
      description: 'Centro histórico'
    },
    {
      name: 'Manta',
      coordinates: [-0.9621, -80.7127] as [number, number],
      description: 'Ciudad portuaria'
    },
    {
      name: 'Portoviejo',
      coordinates: [-1.0544, -80.4545] as [number, number],
      description: 'Capital de Manabí'
    }
  ]
};

// Colores para diferentes tipos de zonas
export const ZONE_COLORS = {
  SEGURA: '#10B981',      // Verde
  RESTRINGIDA: '#F59E0B', // Amarillo
  PELIGRO: '#EF4444',     // Rojo
  DEFAULT: '#3B82F6'      // Azul
};

// Utilidades geográficas
export const geoUtils = {
  // Verificar si las coordenadas están dentro de Ecuador
  isWithinEcuador: (lat: number, lng: number): boolean => {
    return lat >= -5.015 && lat <= 1.469 && lng >= -81.419 && lng <= -75.192;
  },

  // Calcular área de un polígono usando la fórmula de Gauss
  calculatePolygonArea: (polygon: [number, number][]): number => {
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
  },

  // Calcular perímetro de un polígono
  calculatePolygonPerimeter: (polygon: [number, number][]): number => {
    if (polygon.length < 2) return 0;
    
    let perimeter = 0;
    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      const dx = polygon[j][0] - polygon[i][0];
      const dy = polygon[j][1] - polygon[i][1];
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    // Convertir a km (aproximado)
    return parseFloat((perimeter * 111).toFixed(2));
  },

  // Calcular centroide de un polígono
  calculatePolygonCentroid: (polygon: [number, number][]): [number, number] => {
    if (polygon.length === 0) return [0, 0];
    
    let centroidX = 0;
    let centroidY = 0;
    
    for (const point of polygon) {
      centroidX += point[0];
      centroidY += point[1];
    }
    
    return [
      centroidX / polygon.length,
      centroidY / polygon.length
    ];
  },

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  calculateDistance: (point1: [number, number], point2: [number, number]): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
               Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
               Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Formatear coordenadas para mostrar
  formatCoordinates: (lat: number, lng: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
  },

  // Validar formato de coordenadas
  validateCoordinates: (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  // Validar polígono
  validatePolygon: (polygon: [number, number][]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (polygon.length < 3) {
      errors.push('El polígono debe tener al menos 3 puntos');
    }
    
    if (polygon.length > 1000) {
      errors.push('El polígono no puede tener más de 1000 puntos');
    }
    
    // Verificar que todas las coordenadas sean válidas
    for (let i = 0; i < polygon.length; i++) {
      const [lat, lng] = polygon[i];
      if (!geoUtils.validateCoordinates(lat, lng)) {
        errors.push(`Coordenadas inválidas en el punto ${i + 1}: [${lat}, ${lng}]`);
      }
      
      if (!geoUtils.isWithinEcuador(lat, lng)) {
        errors.push(`El punto ${i + 1} está fuera de Ecuador: [${lat}, ${lng}]`);
      }
    }
    
    // Verificar que no haya puntos duplicados consecutivos
    for (let i = 0; i < polygon.length - 1; i++) {
      const [lat1, lng1] = polygon[i];
      const [lat2, lng2] = polygon[i + 1];
      
      if (Math.abs(lat1 - lat2) < 0.000001 && Math.abs(lng1 - lng2) < 0.000001) {
        errors.push(`Puntos duplicados consecutivos en las posiciones ${i + 1} y ${i + 2}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Configuración de estilos del mapa
export const MAP_STYLES = {
  // Estilos para polígonos de zonas
  zonePolygon: {
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.2
  },
  
  // Estilos para polígonos en construcción
  drawingPolygon: {
    weight: 3,
    opacity: 0.9,
    fillOpacity: 0.1,
    dashArray: '5, 10'
  },
  
  // Estilos para marcadores
  marker: {
    radius: 6,
    weight: 2,
    fillOpacity: 0.8
  }
};

export default mapConfig;
