import { Search, MapPin, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "1. Cherche",
    description: "Tape le nom de ton médicament dans la barre de recherche"
  },
  {
    icon: MapPin,
    title: "2. Compare",
    description: "Vois les prix et la disponibilité dans les pharmacies près de toi"
  },
  {
    icon: ShoppingBag,
    title: "3. Trouve",
    description: "Rends-toi dans la pharmacie de ton choix avec les horaires"
  }
];

const HowItWorks = () => {
  return (
    <section id="comment-ca-marche" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Comment ça marche
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trois étapes simples pour trouver ton médicament rapidement
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-medium group-hover:shadow-strong transition-all duration-300 group-hover:scale-110">
                <step.icon className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {step.title}
              </h3>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;