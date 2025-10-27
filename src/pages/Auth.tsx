import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Pill, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getLocationWithFallback, getLocationMessage, GeolocationResult } from "@/utils/geolocation";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationResult, setLocationResult] = useState<GeolocationResult | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre espace pharmacie",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Vérifiez vos identifiants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationDetection = async () => {
    setLocationLoading(true);
    try {
      const result = await getLocationWithFallback();
      setLocationResult(result);
      
      const message = getLocationMessage(result);
      toast({
        title: message.title,
        description: message.description,
        variant: message.variant,
      });
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationResult) {
      toast({
        title: "Localisation requise",
        description: "Veuillez détecter votre localisation avant de vous inscrire.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/validation`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            latitude: locationResult.latitude.toString(),
            longitude: locationResult.longitude.toString(),
            locationSource: locationResult.source
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Inscription réussie ✅",
        description: "Vérifiez votre email pour confirmer votre compte",
      });

      setEmail("");
      setPassword("");
      setLocationResult(null);
    } catch (error: any) {
      const errorMessage = error.message || "Impossible de créer le compte";
      
      toast({
        title: "Erreur d'inscription",
        description: errorMessage.includes("already registered") 
          ? "Cette adresse email est déjà utilisée. Utilisez la connexion."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-12 w-12 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">PharmaCity</h1>
          </div>
          <p className="text-white/90">Espace Pharmacie</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle>Connexion Pharmacie</CardTitle>
            <CardDescription>
              Gérez votre stock et vos informations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre-pharmacie@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre-pharmacie@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimum 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {/* Section Géolocalisation */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Localisation de votre pharmacie</Label>
                    
                    {!locationResult ? (
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={handleLocationDetection}
                        disabled={locationLoading}
                        className="w-full"
                      >
                        {locationLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Détection en cours...
                          </>
                        ) : (
                          <>
                            <MapPin className="mr-2 h-4 w-4" />
                            Détecter ma localisation
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium text-success">
                              Position détectée
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleLocationDetection}
                            disabled={locationLoading}
                          >
                            Redetécter
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {locationResult.latitude.toFixed(6)}, {locationResult.longitude.toFixed(6)}
                          {locationResult.source === 'browser' && ' (GPS précis)'}
                          {locationResult.source === 'ip' && ' (Approximatif)'}
                          {locationResult.source === 'fallback' && ' (Par défaut)'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !locationResult}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      "S'inscrire"
                    )}
                  </Button>
                  
                  {!locationResult && (
                    <p className="text-xs text-muted-foreground text-center">
                      La localisation est requise pour que les clients puissent trouver votre pharmacie
                    </p>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;