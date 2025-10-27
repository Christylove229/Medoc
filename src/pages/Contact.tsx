import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive"
      });
      return;
    }

    try {
      // Envoyer le message à Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            message: formData.message.trim()
          }
        ]);

      if (error) throw error;

      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      // Réinitialiser le formulaire
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28">
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-12 text-center">
                Contactez-nous
              </h1>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Informations de contact */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                      Informations de contact
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      N'hésitez pas à nous contacter pour toute question ou suggestion.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 rounded-lg bg-accent/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <p className="text-muted-foreground">christylovedovonon1@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-lg bg-accent/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Téléphone</h3>
                        <p className="text-muted-foreground">+229 0142048530</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-lg bg-accent/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Localisation</h3>
                        <p className="text-muted-foreground">Covè, Bénin</p>
                      </div>
                    </div>

                    <div className="mt-8 p-6 rounded-lg bg-gradient-primary text-white">
                      <h3 className="font-semibold mb-2">DOVONON E. J. Christylove</h3>
                      <p className="text-white/90 text-sm">Créateur de PharmaCity</p>
                    </div>
                  </div>
                </div>

                {/* Formulaire de contact */}
                <div className="bg-card rounded-2xl p-8 shadow-elegant border border-border">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Envoyez-nous un message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom et Prénom</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Votre nom complet"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12"
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre.email@exemple.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12"
                        maxLength={255}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Votre message..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="min-h-[150px] resize-none"
                        maxLength={1000}
                        required
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.message.length}/1000
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg"
                    >
                      Envoyer le message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;