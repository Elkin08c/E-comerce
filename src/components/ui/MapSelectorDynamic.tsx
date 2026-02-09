import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapSelector = dynamic(() => import('./MapSelector'), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 border rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando mapa...</span>
        </div>
    ),
});

export default MapSelector;
