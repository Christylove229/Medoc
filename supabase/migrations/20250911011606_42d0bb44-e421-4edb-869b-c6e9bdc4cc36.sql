-- Corriger les avertissements de sécurité pour les fonctions
-- Les fonctions doivent avoir search_path défini de manière sécurisée

-- Recréer la fonction search_medicament avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.search_medicament(search_term TEXT)
RETURNS TABLE (
    medicament_nom TEXT,
    medicament_id UUID,
    pharmacie_nom TEXT,
    pharmacie_id UUID,
    pharmacie_adresse TEXT,
    pharmacie_latitude FLOAT,
    pharmacie_longitude FLOAT,
    pharmacie_horaires TEXT,
    pharmacie_telephone TEXT,
    prix DECIMAL(10,2),
    quantite INTEGER,
    disponible BOOLEAN
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recréer la fonction get_pharmacy_stocks avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.get_pharmacy_stocks(pharmacy_id UUID)
RETURNS TABLE (
    stock_id UUID,
    medicament_nom TEXT,
    medicament_forme TEXT,
    medicament_dosage TEXT,
    prix DECIMAL(10,2),
    quantite INTEGER,
    disponible BOOLEAN
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;