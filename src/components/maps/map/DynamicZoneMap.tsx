import { Suspense } from 'react';
import ZoneMap from './ZoneMap';

// Loading component
const LoadingComponent = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 border-2 border-[#1559ED] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[#1559ED]">Cargando mapa...</span>
    </div>
  </div>
);

export default function DynamicZoneMap() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ZoneMap />
    </Suspense>
  );
}
