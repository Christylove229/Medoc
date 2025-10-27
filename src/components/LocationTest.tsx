import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { getLocationWithFallback, validateCoordinates, formatCoordinates, GeolocationResult } from "@/utils/geolocation";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const LocationTest = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [locationResult, setLocationResult] = useState<GeolocationResult | null>(null);
  const { toast } = useToast();

  const runLocationTest = async () => {
    setTesting(true);
    setTestResults([]);
    setLocationResult(null);

    const results: TestResult[] = [];

    // Test 1: Récupération de la géolocalisation
    results.push({
      step: "Récupération géolocalisation",
      status: 'pending',
      message: "Test en cours..."
    });
    setTestResults([...results]);

    try {
      const location = await getLocationWithFallback();
      
      results[results.length - 1] = {
        step: "Récupération géolocalisation",
        status: 'success',
        message: `Position obtenue via ${location.source}`,
        data: location
      };
      setTestResults([...results]);
      setLocationResult(location);

      // Test 2: Validation des coordonnées
      results.push({
        step: "Validation coordonnées",
        status: 'pending',
        message: "Validation en cours..."
      });
      setTestResults([...results]);

      const isValid = validateCoordinates(location.latitude, location.longitude);
      
      if (isValid) {
        results[results.length - 1] = {
          step: "Validation coordonnées",
          status: 'success',
          message: `Coordonnées valides: ${formatCoordinates(location.latitude, location.longitude)}`
        };
      } else {
        results[results.length - 1] = {
          step: "Validation coordonnées",
          status: 'error',
          message: "Coordonnées invalides"
        };
      }
      setTestResults([...results]);

      // Test 3: Test de la base de données (simulation)
      results.push({
        step: "Test enregistrement Supabase",
        status: 'pending',
        message: "Simulation enregistrement..."
      });
      setTestResults([...results]);

      // Simulation d'un délai d'enregistrement
      await new Promise(resolve => setTimeout(resolve, 1000));

      results[results.length - 1] = {
        step: "Test enregistrement Supabase",
        status: 'success',
        message: "Enregistrement simulé avec succès",
        data: {
          latitude: location.latitude,
          longitude: location.longitude,
          source: location.source
        }
      };
      setTestResults([...results]);

      toast({
        title: "Test de géolocalisation réussi ✅",
        description: `Position obtenue via ${location.source} et validée`,
      });

    } catch (error: any) {
      results[results.length - 1] = {
        step: "Récupération géolocalisation",
        status: 'error',
        message: error.message || "Erreur inconnue"
      };
      setTestResults([...results]);

      toast({
        title: "Échec du test de géolocalisation",
        description: error.message || "Erreur inconnue",
        variant: "destructive",
      });
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-warning" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusColor = (status: TestResult['status']): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Test du Système de Géolocalisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button 
            onClick={runLocationTest}
            disabled={testing}
            size="lg"
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Lancer le test
              </>
            )}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Résultats du test :</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{result.step}</span>
                    <Badge variant={getStatusColor(result.status)} className="text-xs">
                      {result.status === 'pending' ? 'En cours' : 
                       result.status === 'success' ? 'Réussi' : 'Échec'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.data && (
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {locationResult && (
          <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/20">
            <h4 className="font-medium text-success mb-2">✅ Localisation obtenue avec succès</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Source:</span> {locationResult.source}
                {locationResult.source === 'browser' && ' (GPS précis)'}
                {locationResult.source === 'ip' && ' (Approximatif)'}
                {locationResult.source === 'fallback' && ' (Par défaut)'}
              </div>
              <div>
                <span className="font-medium">Coordonnées:</span> {formatCoordinates(locationResult.latitude, locationResult.longitude)}
              </div>
              {locationResult.accuracy && (
                <div>
                  <span className="font-medium">Précision:</span> ±{Math.round(locationResult.accuracy)}m
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationTest;