import React, { useEffect, useRef } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

interface Pharmacy {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  horaires: string;
  telephone: string;
}

interface Medication {
  medicament_nom: string;
  prix: number;
}

interface MedicationMapProps {
  userLocation: UserLocation;
  pharmacy: Pharmacy;
  medication: Medication;
}

export const MedicationMap: React.FC<MedicationMapProps> = ({ 
  userLocation, 
  pharmacy, 
  medication 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    const loadMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      await import('leaflet-routing-machine');
      await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');

      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create custom icons
      const userIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const pharmacyIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Calculate center point
      const centerLat = (userLocation.lat + pharmacy.latitude) / 2;
      const centerLng = (userLocation.lng + pharmacy.longitude) / 2;

      // Create map
      const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add user marker
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-center">
            <strong>Votre position</strong><br>
            📍 Vous êtes ici
          </div>
        `);

      // Add pharmacy marker
      const pharmacyMarker = L.marker([pharmacy.latitude, pharmacy.longitude], { icon: pharmacyIcon })
        .addTo(map)
        .bindPopup(`
          <div class="space-y-2 min-w-[200px]">
            <h4 class="font-semibold text-primary">${pharmacy.nom}</h4>
            <p class="text-sm">${pharmacy.adresse}</p>
            <div class="border-t pt-2">
              <p class="text-sm"><strong>Médicament:</strong> ${medication.medicament_nom}</p>
              <p class="text-sm"><strong>Prix:</strong> ${medication.prix} FCFA</p>
            </div>
            <div class="border-t pt-2">
              <p class="text-xs text-muted-foreground">📞 ${pharmacy.telephone}</p>
              <p class="text-xs text-muted-foreground">🕒 ${pharmacy.horaires}</p>
            </div>
          </div>
        `);

      // Add routing
      try {
        const routingControl = (L as any).Routing.control({
          waypoints: [
            L.latLng(userLocation.lat, userLocation.lng),
            L.latLng(pharmacy.latitude, pharmacy.longitude)
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          createMarker: () => null, // Use our custom markers
          lineOptions: {
            styles: [{ color: '#22c55e', weight: 4, opacity: 0.8 }]
          },
          show: false,
          collapsible: true,
        }).addTo(map);

        // Fit bounds to include both markers
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [pharmacy.latitude, pharmacy.longitude]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.warn('Routing not available, showing markers only');
        // Fallback: just fit bounds to show both markers
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [pharmacy.latitude, pharmacy.longitude]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, pharmacy, medication]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-input shadow-medium">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};