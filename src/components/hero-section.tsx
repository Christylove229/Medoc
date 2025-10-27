import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { MapPin, Pill, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLocationWithFallback, getLocationMessage } from "@/utils/geolocation";
import { useToast } from "@/hooks/use-toast";
import SmartSearch from "@/components/smart-search";

interface SmartSearchInstance {
  isSearching: boolean;
}

const HeroSection = () => {
  const [searchValue, setSearchValue] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    
    // Naviguer vers la page de résultats avec le terme de recherche
    navigate(`/results?q=${encodeURIComponent(value.trim())}`);
  };

  const handleLocationRequest = async () => {
    setLocationLoading(true);
    
    try {
      const result = await getLocationWithFallback();
      const { latitude, longitude } = result;
      
      setLocation(`${latitude}, ${longitude}`);
      
      // Afficher un message selon la source de géolocalisation
      const message = getLocationMessage(result);
      toast({
        title: message.title,
        description: "Redirection vers les pharmacies proches...",
        variant: message.variant,
      });
      
      // Naviguer vers la page de résultats des pharmacies proches
      navigate(`/results?nearby=true&lat=${latitude}&lng=${longitude}&source=${result.source}`);
    } catch (error: any) {
      toast({
        title: "Erreur de localisation",
        description: "Impossible de déterminer votre position. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Decoration elements */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      <div className="absolute top-10 left-10 opacity-20">
        <Pill className="h-16 w-16 text-white animate-pulse-soft" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-15">
        <Pill className="h-20 w-20 text-white animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>
      
      {/* Floating animated pills */}
      <div className="absolute top-40 left-1/4 animate-float opacity-10" style={{ animationDelay: "0.5s" }}>
        <Pill className="h-12 w-12 text-white" />
      </div>
      <div className="absolute top-60 right-1/3 animate-float opacity-10" style={{ animationDelay: "1.5s" }}>
        <Pill className="h-10 w-10 text-white rotate-45" />
      </div>
      <div className="absolute bottom-40 left-1/3 animate-float opacity-10" style={{ animationDelay: "2s" }}>
        <Pill className="h-14 w-14 text-white -rotate-12" />
      </div>
      
      {/* Gradient orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-scale-in">
            <span className="block text-center">PharmaCity</span>
            <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal opacity-90 mt-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Trouve ton médicament en un clic
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in px-4" style={{ animationDelay: "0.3s" }}>
            Découvrez la disponibilité, les prix et les horaires des pharmacies du Bénin instantanément
          </p>
        </div>

        <div className="animate-slide-up max-w-4xl mx-auto space-y-6 sm:space-y-8" style={{ animationDelay: "0.4s" }}>
          {/* Recherche intelligente */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-elegant">
            <SmartSearch 
              onSearchStateChange={setIsSearching} 
              onSearchValueChange={setSearchValue}
            />
          </div>
          
          {/* Boutons d'action alternatifs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center transition-all duration-300 mb-8 sm:mb-12">
              <Button 
                size="lg" 
                onClick={() => handleSearch(searchValue)}
                className="bg-white text-primary hover:bg-white/90 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold shadow-medium"
              >
                <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Rechercher
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={handleLocationRequest}
                disabled={locationLoading}
                className="border-white/30 text-white bg-white/5 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg backdrop-blur-sm"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Localisation...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Pharmacies proches
                  </>
                )}
              </Button>
            </div>

          {location && (
            <p className="text-white/80 text-sm">
              📍 Position détectée
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;