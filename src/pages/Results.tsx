import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Clock, ArrowLeft, Filter, Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
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
}

interface NearbyPharmacy {
  pharmacie_id: string;
  pharmacie_nom: string;
  pharmacie_adresse: string;
  pharmacie_latitude: number;
  pharmacie_longitude: number;
  pharmacie_horaires: string;
  pharmacie_telephone: string;
  distance_km: number;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<NearbyPharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"prix" | "pharmacie" | "distance" | "nom_medicament" | "disponibilite">("prix");
  const [isNearbySearch, setIsNearbySearch] = useState(false);
  const [locationSource, setLocationSource] = useState<string>("");
  const { toast } = useToast();

  // Fonction pour ouvrir WhatsApp avec le numéro de téléphone
  const openWhatsApp = (phoneNumber: string, pharmacyName: string, medicationName: string) => {
    if (!phoneNumber || !phoneNumber.trim()) {
      toast({
        title: "Numéro invalide",
        description: "Ce numéro de téléphone n'est pas disponible",
        variant: "destructive",
      });
      return;
    }

    // Nettoyer le numéro de téléphone (enlever les espaces et caractères spéciaux)
    let cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
    
    // Format WhatsApp pour le Bénin : +229XXXXXXXX (8 chiffres après +229)
    let formattedPhone = '';
    
    // Enlever tous les caractères non numériques sauf le +
    cleanPhone = cleanPhone.replace(/[^\d+]/g, '');
    
    // Traitement selon le format d'entrée
    if (cleanPhone.startsWith('+2290')) {
      // Format: +2290XXXXXXXX
      formattedPhone = '+229' + cleanPhone.substring(5);
    } else if (cleanPhone.startsWith('+229')) {
      // Format: +229XXXXXXXX
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('2290')) {
      // Format: 2290XXXXXXXX
      formattedPhone = '+229' + cleanPhone.substring(4);
    } else if (cleanPhone.startsWith('229')) {
      // Format: 229XXXXXXXX
      formattedPhone = '+' + cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      // Format: 0XXXXXXXX
      formattedPhone = '+229' + cleanPhone.substring(1);
    } else {
      // Format: XXXXXXXXX
      formattedPhone = '+229' + cleanPhone;
    }
    
    // Normaliser : garder seulement le + et les chiffres, max 12 chiffres après le +
    const digits = formattedPhone.replace(/[^\d]/g, '');
    formattedPhone = '+' + digits;
    
    // Validation : le numéro doit avoir exactement 12 chiffres (+229XXXXXXXX)
    if (formattedPhone.length !== 13 || !formattedPhone.startsWith('+229')) {
      toast({
        title: "Numéro invalide",
        description: `Le numéro ${phoneNumber} n'est pas au bon format pour le Bénin`,
        variant: "destructive",
      });
      return;
    }

    // Message par défaut
    const message = `Bonjour, je souhaite me renseigner sur la disponibilité et le prix du médicament "${medicationName}" dans votre pharmacie "${pharmacyName}". Merci.`;
    
    // URL WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp ouvert",
      description: `Conversation avec ${pharmacyName} lancée`,
    });
  };

  const fetchResults = async (term: string) => {
    if (!term.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_medicament', {
        search_term: term
      });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les résultats",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPharmacies = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_nearby_pharmacies', {
        user_lat: lat,
        user_lon: lng,
        max_distance: 10
      });

      if (error) throw error;
      setNearbyPharmacies(data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche des pharmacies proches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les pharmacies proches",
        variant: "destructive",
      });
      setNearbyPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    const nearby = searchParams.get('nearby');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const source = searchParams.get('source') || '';

    if (nearby === 'true' && lat && lng) {
      setIsNearbySearch(true);
      setLocationSource(source);
      setSortBy("distance");
      fetchNearbyPharmacies(parseFloat(lat), parseFloat(lng));
    } else if (q) {
      setIsNearbySearch(false);
      setSearchTerm(q);
      fetchResults(q);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleNewSearch = (value: string) => {
    setSearchTerm(value);
    setIsNearbySearch(false);
    fetchResults(value);
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "prix":
        return a.prix - b.prix;
      case "pharmacie":
        return a.pharmacie_nom.localeCompare(b.pharmacie_nom);
      case "nom_medicament":
        return a.medicament_nom.localeCompare(b.medicament_nom);
      case "disponibilite":
        if (a.disponible && !b.disponible) return -1;
        if (!a.disponible && b.disponible) return 1;
        return a.prix - b.prix; // Si même disponibilité, trier par prix
      default:
        return 0;
    }
  });

  const sortedNearbyPharmacies = [...nearbyPharmacies].sort((a, b) => {
    if (sortBy === "distance") {
      return a.distance_km - b.distance_km;
    } else {
      return a.pharmacie_nom.localeCompare(b.pharmacie_nom);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          {/* Header de recherche */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {isNearbySearch ? "Pharmacies proches" : searchTerm ? `Résultats pour "${searchTerm}"` : "Rechercher un médicament"}
                </h1>
                {isNearbySearch && locationSource && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {locationSource === 'browser' && '📍 Position GPS précise'}
                      {locationSource === 'ip' && '🌐 Position approximative (IP)'}
                      {locationSource === 'fallback' && '🏥 Position par défaut (Cotonou)'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {!isNearbySearch && (
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <SearchInput
                    placeholder="Rechercher un autre médicament..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleNewSearch}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={(value: "prix" | "pharmacie" | "nom_medicament" | "disponibilite") => setSortBy(value)}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Trier par..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prix">💰 Prix croissant</SelectItem>
                      <SelectItem value="pharmacie">🏥 Nom de pharmacie</SelectItem>
                      <SelectItem value="nom_medicament">💊 Nom du médicament</SelectItem>
                      <SelectItem value="disponibilite">✅ Disponibilité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {isNearbySearch && (
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value: "distance" | "pharmacie") => setSortBy(value)}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Trier par..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">📍 Distance</SelectItem>
                    <SelectItem value="pharmacie">🏥 Nom de pharmacie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Résultats */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                {isNearbySearch ? "Recherche des pharmacies proches..." : "Recherche en cours..."}
              </p>
            </div>
          ) : isNearbySearch ? (
            sortedNearbyPharmacies.length > 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-6">
                  {sortedNearbyPharmacies.length} pharmacie{sortedNearbyPharmacies.length > 1 ? 's' : ''} trouvée{sortedNearbyPharmacies.length > 1 ? 's' : ''} à proximité
                </p>

                {sortedNearbyPharmacies.map((pharmacy, index) => (
                  <Card key={`${pharmacy.pharmacie_id}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-foreground">
                            {pharmacy.pharmacie_nom}
                          </CardTitle>
                          <p className="text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {pharmacy.pharmacie_adresse}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-primary font-medium">
                          📍 {pharmacy.distance_km.toFixed(1)} km
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{pharmacy.pharmacie_horaires || "Horaires non renseignés"}</span>
                        </div>
                        {pharmacy.pharmacie_telephone && (
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{pharmacy.pharmacie_telephone}</span>
                          </div>
                        )}
                        <div className="flex justify-end">
                          {pharmacy.pharmacie_telephone && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openWhatsApp(pharmacy.pharmacie_telephone, pharmacy.pharmacie_nom, "médicaments")}
                              className="text-primary border-primary hover:bg-primary hover:text-white"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contacter
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  Aucune pharmacie proche trouvée dans un rayon de 10 km
                </p>
                <p className="text-sm text-muted-foreground">
                  Essayez d'élargir votre zone de recherche ou vérifiez votre position
                </p>
              </div>
            )
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                {searchTerm ? `Aucun résultat trouvé pour "${searchTerm}"` : "Entrez le nom d'un médicament pour commencer la recherche"}
              </p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground">
                  Essayez avec un autre nom de médicament
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''} pour <span className="font-medium text-primary">"{searchTerm}"</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Triés par:</span>
                  <Badge variant="outline">
                    {sortBy === 'prix' && '💰 Prix'}
                    {sortBy === 'pharmacie' && '🏥 Pharmacie'}
                    {sortBy === 'nom_medicament' && '💊 Médicament'}
                    {sortBy === 'disponibilite' && '✅ Disponibilité'}
                  </Badge>
                </div>
              </div>

              {sortedResults.map((result, index) => (
                <Card key={`${result.pharmacie_id}-${index}`} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary" className="text-sm font-medium">
                            💊 {result.medicament_nom}
                          </Badge>
                          <Badge variant={result.disponible ? "default" : "destructive"} className="text-xs">
                            {result.disponible ? "✅ Disponible" : "❌ Indisponible"}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-foreground mb-1">
                          {result.pharmacie_nom}
                        </CardTitle>
                        <p className="text-muted-foreground flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {result.pharmacie_adresse}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {result.prix.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">FCFA</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{result.pharmacie_horaires || "Horaires non renseignés"}</span>
                      </div>
                      {result.pharmacie_telephone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <span>{result.pharmacie_telephone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          📦 Stock: {result.quantite} unité{result.quantite > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openWhatsApp(result.pharmacie_telephone, result.pharmacie_nom, result.medicament_nom)}
                          className="text-primary border-primary hover:bg-primary hover:text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contacter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;