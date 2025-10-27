import Header from "@/components/header";
import Footer from "@/components/footer";

const Mission = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28">
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-12">
                Notre mission
              </h1>
              
              <div className="prose prose-lg mx-auto">
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                  PharmaCity a pour objectif de rapprocher les pharmacies des populations en leur offrant une visibilité en ligne et en facilitant l'accès aux produits de santé.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Notre plateforme permet aux utilisateurs de trouver rapidement les médicaments dont ils ont besoin, 
                  de comparer les prix et la disponibilité, et de localiser les pharmacies les plus proches. 
                  Pour les pharmaciens, nous offrons un moyen efficace d'augmenter leur visibilité, 
                  de gérer leur stock en ligne et d'attirer plus de clients.
                </p>
              </div>
              
              <div className="mt-16 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground/70">
                  Créé par DOVONON E. J. Christylove
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Mission;