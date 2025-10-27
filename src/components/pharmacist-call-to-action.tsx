import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PharmacistCallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 text-center bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Vous êtes pharmacien ?
        </h2>
        
        <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
          Rejoignez PharmaCity et augmentez votre visibilité. Gérez votre stock en ligne et attirez plus de clients.
        </p>
        
        <Button 
          size="lg"
          className="bg-white text-primary hover:bg-gray-100 h-16 px-12 text-lg font-semibold rounded-xl shadow-medium"
          onClick={() => navigate('/auth')}
        >
          Rejoindre PharmaCity
        </Button>
      </div>
    </section>
  );
};

export default PharmacistCallToAction;