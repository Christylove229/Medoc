import Header from "@/components/header";
import Footer from "@/components/footer";
import LocationTest from "@/components/LocationTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Database, Code, CheckCircle } from "lucide-react";

const DevTest = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tests de Développement - MeDo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interface de test pour valider le système de géolocalisation et les fonctionnalités critiques
            </p>
          </div>

          <div className="grid gap-8 max-w-4xl mx-auto">
            {/* Statut du système */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Statut des Fonctionnalités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Géolocalisation Browser</span>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Actif
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">API IP Fallback</span>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Actif
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Position Fallback</span>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Cotonou, Bénin
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">Supabase Functions</span>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Opérationnel
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test de géolocalisation */}
            <LocationTest />

            {/* Instructions de test */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions de Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">1. Test de géolocalisation complète :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Cliquez sur "Lancer le test" ci-dessus</li>
                    <li>• Autorisez la géolocalisation quand demandé (test browser)</li>
                    <li>• Observez le fallback vers l'API IP si refusé</li>
                    <li>• Vérifiez que la position fallback fonctionne en dernier recours</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">2. Test d'inscription pharmacie :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Allez sur <code className="bg-muted px-1 rounded">/auth</code></li>
                    <li>• Testez l'inscription avec géolocalisation</li>
                    <li>• Vérifiez l'enregistrement en base Supabase</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">3. Test recherche pharmacies proches :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Depuis la page d'accueil, cliquez "Pharmacies proches"</li>
                    <li>• Vérifiez l'affichage des résultats triés par distance</li>
                    <li>• Testez avec et sans géolocalisation autorisée</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning-foreground">
                    <strong>⚠️ Note :</strong> Cette page est destinée aux développeurs et tests. 
                    Elle ne doit pas être accessible en production.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DevTest;