import { Pill, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-foreground text-white py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo et description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Pill className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">PharmaCity</span>
            </div>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              La plateforme qui connecte les patients aux pharmacies du Bénin pour un accès rapide aux médicaments.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Navigation</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="/" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#comment-ca-marche" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="/mission" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors">
                  Notre mission
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-white/80 break-all">christylovedovonon1@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2 sm:space-x-3">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-white/80">+229 0142048530</span>
              </li>
              <li className="flex items-center space-x-2 sm:space-x-3">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-white/80">Covè, Bénin</span>
              </li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">À propos</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="/mission" className="text-sm sm:text-base text-white/80 hover:text-white transition-colors">
                  Notre mission
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-white/60">
            © 2025 PharmaCity. Tous droits réservés. Fait avec ❤️ pour le Bénin.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;