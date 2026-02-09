"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
const icon = L.icon({
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Hack for default marker icons if local assets are missing
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

interface MapSelectorProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ onSelect, initialPosition }: { onSelect: (lat: number, lng: number) => void, initialPosition: [number, number] | null }) {
    const [position, setPosition] = useState<[number, number] | null>(initialPosition);
    const map = useMap();

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
            map.flyTo(initialPosition, map.getZoom());
        }
    }, [initialPosition, map]);

    useMapEvents({
        click(e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={L.divIcon({ className: 'bg-transparent', html: '<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>' })}>
        </Marker>
        // Using a simple divIcon to avoid asset issues for now, or we can use the default if assets exist
    );
}

export default function MapSelector({ initialLat, initialLng, onLocationSelect }: MapSelectorProps) {
    // Default to Cuenca, Ecuador if no location provided
    const center: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : [-2.9001, -79.0059];

    return (
        <div className="h-[300px] w-full rounded-md overflow-hidden border">
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onSelect={onLocationSelect} initialPosition={initialLat && initialLng ? [initialLat, initialLng] : null} />
            </MapContainer>
        </div>
    );
}
