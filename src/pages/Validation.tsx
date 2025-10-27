import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Validation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

        if (error) {
          toast({
            title: "Erreur de confirmation",
            description: "Le lien de confirmation n'est pas valide ou a expiré.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Compte confirmé !",
            description: "Votre compte est maintenant activé.",
          });
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Pill className="h-12 w-12 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">PharmaCity</h1>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Bienvenue sur PharmaCity ! 🎉
            </h2>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-gray-800 font-semibold">
                Votre compte pharmacie a été confirmé avec succès !
              </p>
              <p className="text-gray-600 leading-relaxed">
                Vous pouvez maintenant accéder à votre espace pharmacie pour gérer votre stock, 
                vos informations et attirer plus de clients grâce à PharmaCity.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  ✅ Votre localisation a été enregistrée<br/>
                  ✅ Votre pharmacie est maintenant visible aux clients
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate("/auth")}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
              size="lg"
            >
              Accéder à mon espace pharmacie
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Validation;