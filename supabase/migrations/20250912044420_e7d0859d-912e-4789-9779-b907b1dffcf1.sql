-- Fonction pour calculer la distance entre deux points GPS (formule Haversine)
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 double precision,
    lon1 double precision,
    lat2 double precision,
    lon2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
AS $$
DECLARE
    r double precision := 6371; -- Rayon de la Terre en km
    dlat double precision;
    dlon double precision;
    a double precision;
    c double precision;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN r * c;
END;
$$;

-- Fonction pour trouver les pharmacies proches
CREATE OR REPLACE FUNCTION public.get_nearby_pharmacies(
    user_lat double precision,
    user_lon double precision,
    max_distance double precision DEFAULT 10
)
RETURNS TABLE(
    pharmacie_id uuid,
    pharmacie_nom text,
    pharmacie_adresse text,
    pharmacie_latitude double precision,
    pharmacie_longitude double precision,
    pharmacie_horaires text,
    pharmacie_telephone text,
    distance_km double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as pharmacie_id,
        p.nom as pharmacie_nom,
        p.adresse as pharmacie_adresse,
        p.latitude as pharmacie_latitude,
        p.longitude as pharmacie_longitude,
        p.horaires as pharmacie_horaires,
        p.telephone as pharmacie_telephone,
        calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance_km
    FROM public.pharmacies p
    WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= max_distance
    ORDER BY distance_km ASC;
END;
$$;