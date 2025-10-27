-- Créer un trigger pour automatiquement créer le profil pharmacie lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_pharmacy_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Vérifier si des données de géolocalisation sont disponibles
    IF NEW.raw_user_meta_data IS NOT NULL THEN
        -- Créer le profil de pharmacie avec les données GPS si disponibles
        INSERT INTO public.pharmacies (
            user_id,
            nom,
            adresse,
            latitude,
            longitude,
            horaires,
            telephone
        ) VALUES (
            NEW.id,
            COALESCE('Pharmacie ' || split_part(NEW.email, '@', 1), 'Nouvelle Pharmacie'),
            'Adresse à compléter',
            CASE 
                WHEN NEW.raw_user_meta_data->>'latitude' IS NOT NULL 
                THEN (NEW.raw_user_meta_data->>'latitude')::double precision
                ELSE NULL
            END,
            CASE 
                WHEN NEW.raw_user_meta_data->>'longitude' IS NOT NULL 
                THEN (NEW.raw_user_meta_data->>'longitude')::double precision
                ELSE NULL
            END,
            '8h-18h (à modifier)',
            'À compléter'
        );
    ELSE
        -- Créer le profil sans géolocalisation
        INSERT INTO public.pharmacies (
            user_id,
            nom,
            adresse,
            horaires,
            telephone
        ) VALUES (
            NEW.id,
            'Pharmacie ' || split_part(NEW.email, '@', 1),
            'Adresse à compléter',
            '8h-18h (à modifier)',
            'À compléter'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Créer le trigger sur la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_pharmacy_user();