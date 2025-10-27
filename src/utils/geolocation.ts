export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'browser' | 'ip' | 'fallback';
}

export interface GeolocationError {
  code: string;
  message: string;
}

/**
 * Valide que les coordonnées GPS sont dans les plages correctes
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
};

/**
 * Récupère la position via navigator.geolocation
 */
const getBrowserLocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Géolocalisation non supportée par ce navigateur'
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 secondes
      maximumAge: 60000 // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        if (!validateCoordinates(latitude, longitude)) {
          reject({
            code: 'INVALID_COORDINATES',
            message: 'Coordonnées GPS invalides reçues du navigateur'
          });
          return;
        }

        resolve({
          latitude,
          longitude,
          accuracy,
          source: 'browser'
        });
      },
      (error) => {
        let message = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Autorisation de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position indisponible';
            break;
          case error.TIMEOUT:
            message = 'Délai d\'attente de géolocalisation dépassé';
            break;
          default:
            message = 'Erreur de géolocalisation inconnue';
        }
        
        reject({
          code: error.code.toString(),
          message
        });
      },
      options
    );
  });
};

/**
 * Récupère la position approximative via API IP
 */
const getIPLocation = async (): Promise<GeolocationResult> => {
  const apis = [
    {
      url: 'https://ipapi.co/json/',
      parser: (data: any) => ({
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude)
      })
    },
    {
      url: 'https://ipinfo.io/json',
      parser: (data: any) => {
        const [lat, lng] = data.loc.split(',').map(parseFloat);
        return { latitude: lat, longitude: lng };
      }
    },
    {
      url: 'http://ip-api.com/json/',
      parser: (data: any) => ({
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon)
      })
    }
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url);
      if (!response.ok) continue;
      
      const data = await response.json();
      const coords = api.parser(data);
      
      if (validateCoordinates(coords.latitude, coords.longitude)) {
        return {
          latitude: coords.latitude,
          longitude: coords.longitude,
          source: 'ip'
        };
      }
    } catch (error) {
      console.warn(`Erreur API ${api.url}:`, error);
      continue;
    }
  }

  throw {
    code: 'IP_API_FAILED',
    message: 'Impossible de récupérer la position via les APIs IP'
  };
};

/**
 * Position de fallback pour le Bénin (Cotonou)
 */
const getFallbackLocation = (): GeolocationResult => {
  return {
    latitude: 6.3703,
    longitude: 2.3912,
    source: 'fallback'
  };
};

/**
 * Fonction principale pour récupérer la géolocalisation avec fallbacks
 */
export const getLocationWithFallback = async (): Promise<GeolocationResult> => {
  try {
    // Tentative 1: Géolocalisation du navigateur (la plus précise)
    console.log('🌍 Tentative de géolocalisation navigateur...');
    const browserResult = await getBrowserLocation();
    console.log('✅ Position navigateur obtenue:', browserResult);
    return browserResult;
  } catch (browserError) {
    console.warn('⚠️ Échec géolocalisation navigateur:', browserError);
    
    try {
      // Tentative 2: API IP (moins précise mais acceptable)
      console.log('🌐 Tentative de géolocalisation IP...');
      const ipResult = await getIPLocation();
      console.log('✅ Position IP obtenue:', ipResult);
      return ipResult;
    } catch (ipError) {
      console.warn('⚠️ Échec géolocalisation IP:', ipError);
      
      // Fallback: Position par défaut (Cotonou, Bénin)
      console.log('📍 Utilisation de la position fallback (Cotonou, Bénin)');
      const fallbackResult = getFallbackLocation();
      console.log('✅ Position fallback utilisée:', fallbackResult);
      return fallbackResult;
    }
  }
};

/**
 * Format les coordonnées pour l'affichage
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Détermine le message à afficher selon la source de géolocalisation
 */
export const getLocationMessage = (result: GeolocationResult): { title: string; description: string; variant?: 'default' | 'destructive' } => {
  switch (result.source) {
    case 'browser':
      return {
        title: 'Localisation détectée avec succès ✅',
        description: `Position précise: ${formatCoordinates(result.latitude, result.longitude)}`,
        variant: 'default'
      };
    case 'ip':
      return {
        title: 'Localisation approximative détectée 📍',
        description: `Position basée sur IP: ${formatCoordinates(result.latitude, result.longitude)}`,
        variant: 'default'
      };
    case 'fallback':
      return {
        title: 'Position par défaut utilisée 🏥',
        description: `Localisation: Cotonou, Bénin. Vous pourrez la modifier plus tard.`,
        variant: 'default'
      };
    default:
      return {
        title: 'Position définie',
        description: `Coordonnées: ${formatCoordinates(result.latitude, result.longitude)}`,
        variant: 'default'
      };
  }
};