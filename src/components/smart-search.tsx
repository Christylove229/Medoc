import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getLocationWithFallback } from "@/utils/geolocation";
import { useToast } from "@/hooks/use-toast";


interface MedicationResult {
  medicament_nom: string;
  medicament_id: string;
  pharmacie_nom: string;
  pharmacie_id: string;
  pharmacie_adresse: string;
  pharmacie_latitude: number;
  pharmacie_longitude: number;
  pharmacie_horaires: string;
  pharmacie_telephone: string;
  prix: number;
  quantite: number;
  disponible: boolean;
  distance?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface SmartSearchProps {
  onSearchStateChange?: (isSearching: boolean) => void;
  onSearchValueChange?: (value: string) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ onSearchStateChange, onSearchValueChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<MedicationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  const [locationLoading, setLocationLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculer la distance entre deux points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Obtenir la localisation utilisateur
  const getUserLocation = async () => {
    if (userLocation) return userLocation;
    
    setLocationLoading(true);
    try {
      const result = await getLocationWithFallback();
      const location = { lat: result.latitude, lng: result.longitude };
      setUserLocation(location);
      toast({
        title: "Position détectée",
        description: "Calcul des distances en cours...",
      });
      return location;
    } catch (error) {
      toast({
        title: "Erreur de localisation",
        description: "Impossible de détecter votre position. Les distances ne seront pas affichées.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Rechercher les médicaments
  const searchMedications = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_medicament', {
        search_term: term
      });

      if (error) throw error;

      let medicationsWithDistance = data || [];

      // Ajouter les distances si la localisation est disponible
      const location = await getUserLocation();
      if (location) {
        medicationsWithDistance = medicationsWithDistance.map((med: MedicationResult) => ({
          ...med,
          distance: calculateDistance(
            location.lat,
            location.lng,
            med.pharmacie_latitude,
            med.pharmacie_longitude
          )
        }));

        // Trier par distance
        medicationsWithDistance.sort((a: MedicationResult, b: MedicationResult) => 
          (a.distance || 0) - (b.distance || 0)
        );
      }

      setResults(medicationsWithDistance.slice(0, 8)); // Limiter à 8 résultats
      setShowDropdown(true);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher les médicaments. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Naviguer vers la page de résultats avec le terme de recherche
      navigate(`/results?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Notifier le parent de l'état de recherche (toujours false maintenant)
  useEffect(() => {
    onSearchStateChange?.(false);
  }, [onSearchStateChange]);

  // Détecter automatiquement la localisation au chargement du composant
  useEffect(() => {
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sélectionner un médicament
  const handleSelectMedication = (medication: MedicationResult) => {
    setSearchTerm(medication.medicament_nom);
    setShowDropdown(false);
    
    toast({
      title: "Médicament sélectionné",
      description: `${medication.medicament_nom} - ${medication.pharmacie_nom}`,
    });
  };

  // Réinitialiser la recherche
  const handleResetSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Barre de recherche */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearchValueChange?.(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Tapez le nom d'un médicament et appuyez sur Entrée..."
            className="flex h-14 w-full rounded-xl border border-input bg-background pl-12 pr-4 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-soft transition-all duration-200 hover:shadow-medium"
          />
        </div>

        {/* Dropdown des résultats - seulement après recherche manuelle */}
        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-input rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.map((medication, index) => (
              <div
                key={`${medication.medicament_id}-${medication.pharmacie_id}-${index}`}
                onClick={() => handleSelectMedication(medication)}
                className="p-4 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary">{medication.medicament_nom}</h4>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {medication.pharmacie_nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{medication.pharmacie_adresse}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{medication.prix} FCFA</p>
                    {medication.distance && (
                      <p className="text-xs text-muted-foreground">
                        {medication.distance.toFixed(1)} km
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Message aucun résultat - seulement après recherche manuelle */}
        {showDropdown && results.length === 0 && !isLoading && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-input rounded-lg shadow-lg p-4 text-center text-muted-foreground">
            <div className="flex flex-col items-center space-y-2">
              <Search className="h-8 w-8 opacity-50" />
              <p>Aucun médicament correspondant n'a été trouvé à proximité.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSearch;