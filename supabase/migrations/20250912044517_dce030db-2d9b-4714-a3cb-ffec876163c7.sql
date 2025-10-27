-- Correction des avertissements de sécurité
-- Mettre à jour les fonctions existantes avec search_path sécurisé

-- Mise à jour de la fonction update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Mise à jour de la fonction search_medicament  
CREATE OR REPLACE FUNCTION public.search_medicament(search_term text)
RETURNS TABLE(medicament_nom text, medicament_id uuid, pharmacie_nom text, pharmacie_id uuid, pharmacie_adresse text, pharmacie_latitude double precision, pharmacie_longitude double precision, pharmacie_horaires text, pharmacie_telephone text, prix numeric, quantite integer, disponible boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.nom as medicament_nom,
        m.id as medicament_id,
        p.nom as pharmacie_nom,
        p.id as pharmacie_id,
        p.adresse as pharmacie_adresse,
        p.latitude as pharmacie_latitude,
        p.longitude as pharmacie_longitude,
        p.horaires as pharmacie_horaires,
        p.telephone as pharmacie_telephone,
        s.prix,
        s.quantite,
        s.disponible
    FROM public.medicaments m
    JOIN public.stocks s ON m.id = s.medicament_id
    JOIN public.pharmacies p ON s.pharmacie_id = p.id
    WHERE m.nom ILIKE '%' || search_term || '%'
    AND s.disponible = true
    AND s.quantite > 0
    ORDER BY s.prix ASC;
END;
$$;

-- Mise à jour de la fonction get_pharmacy_stocks
CREATE OR REPLACE FUNCTION public.get_pharmacy_stocks(pharmacy_id uuid)
RETURNS TABLE(stock_id uuid, medicament_nom text, medicament_forme text, medicament_dosage text, prix numeric, quantite integer, disponible boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as stock_id,
        m.nom as medicament_nom,
        m.forme as medicament_forme,
        m.dosage as medicament_dosage,
        s.prix,
        s.quantite,
        s.disponible
    FROM public.stocks s
    JOIN public.medicaments m ON s.medicament_id = m.id
    WHERE s.pharmacie_id = pharmacy_id
    ORDER BY m.nom ASC;
END;
$$;

-- Mise à jour des nouvelles fonctions avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 double precision,
    lon1 double precision,
    lat2 double precision,
    lon2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
SET search_path = 'public'
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