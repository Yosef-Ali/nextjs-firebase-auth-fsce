import { useEffect, useRef } from 'react';
import { Location } from '@/app/types/location';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationsMapProps {
  locations: Location[];
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export function LocationsMap({ locations }: LocationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [40.4897, 9.1450], // Center of Ethiopia
      zoom: 5
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for each location
    locations.forEach((location) => {
      const { coordinates, title, type } = location;

      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(/images/marker.png)';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${title}</h3>
          <p class="text-sm text-gray-600">${type === 'city' ? 'City Office' : 'Regional Office'}</p>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [locations]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
