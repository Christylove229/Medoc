-- =====================================
-- MEDO - Structure complète de la base de données
-- =====================================

-- 1. Créer la table des pharmacies
CREATE TABLE public.pharmacies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    adresse TEXT NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    horaires TEXT,
    telephone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Créer la table des médicaments
CREATE TABLE public.medicaments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    description TEXT,
    forme TEXT, -- comprimé, sirop, gélule, etc.
    dosage TEXT, -- 500mg, 250ml, etc.
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Créer la table des stocks (relation many-to-many)
CREATE TABLE public.stocks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pharmacie_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
    medicament_id UUID NOT NULL REFERENCES public.medicaments(id) ON DELETE CASCADE,
    prix DECIMAL(10,2) NOT NULL CHECK (prix >= 0),
    quantite INTEGER NOT NULL DEFAULT 0 CHECK (quantite >= 0),
    disponible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(pharmacie_id, medicament_id)
);

-- =====================================
-- INDEXES pour améliorer les performances
-- =====================================

CREATE INDEX idx_pharmacies_location ON public.pharmacies(latitude, longitude);
CREATE INDEX idx_medicaments_nom ON public.medicaments(nom);
CREATE INDEX idx_stocks_pharmacie ON public.stocks(pharmacie_id);
CREATE INDEX idx_stocks_medicament ON public.stocks(medicament_id);
CREATE INDEX idx_stocks_disponible ON public.stocks(disponible);

-- =====================================
-- TRIGGERS pour mise à jour automatique
-- =====================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers pour chaque table
CREATE TRIGGER update_pharmacies_updated_at
    BEFORE UPDATE ON public.pharmacies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicaments_updated_at
    BEFORE UPDATE ON public.medicaments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at
    BEFORE UPDATE ON public.stocks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table pharmacies
-- Les pharmacies peuvent voir et modifier leurs propres données
CREATE POLICY "Pharmacies can view their own data"
    ON public.pharmacies
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pharmacies can update their own data"
    ON public.pharmacies
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Pharmacies can insert their own data"
    ON public.pharmacies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Lecture publique des pharmacies (pour les patients)
CREATE POLICY "Public can view pharmacy info"
    ON public.pharmacies
    FOR SELECT
    USING (true);

-- Politiques pour la table medicaments
-- Lecture publique, seuls les admins peuvent modifier (pour l'instant lecture seule)
CREATE POLICY "Public can view medications"
    ON public.medicaments
    FOR SELECT
    USING (true);

-- Politiques pour la table stocks
-- Les pharmacies peuvent gérer leurs propres stocks
CREATE POLICY "Pharmacies can manage their own stocks"
    ON public.stocks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.pharmacies 
            WHERE pharmacies.id = stocks.pharmacie_id 
            AND pharmacies.user_id = auth.uid()
        )
    );

-- Lecture publique des stocks (pour les patients)
CREATE POLICY "Public can view stocks"
    ON public.stocks
    FOR SELECT
    USING (true);

-- =====================================
-- FONCTIONS UTILES
-- =====================================

-- Fonction pour rechercher des médicaments avec pharmacies
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les stocks d'une pharmacie
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- DONNÉES D'EXEMPLE
-- =====================================

-- Insérer des médicaments d'exemple
INSERT INTO public.medicaments (nom, description, forme, dosage) VALUES
('Paracétamol', 'Antalgique et antipyrétique', 'Comprimé', '500mg'),
('Ibuprofène', 'Anti-inflammatoire non stéroïdien', 'Comprimé', '400mg'),
('Amoxicilline', 'Antibiotique de la famille des pénicillines', 'Gélule', '500mg'),
('Doliprane', 'Antalgique à base de paracétamol', 'Comprimé', '1000mg'),
('Aspirine', 'Antalgique, antipyrétique et anti-inflammatoire', 'Comprimé', '500mg'),
('Efferalgan', 'Paracétamol effervescent', 'Comprimé effervescent', '1000mg'),
('Spasfon', 'Antispasmodique', 'Comprimé', '80mg'),
('Smecta', 'Traitement de la diarrhée', 'Poudre', '3g');

-- Insérer des pharmacies d'exemple (sans user_id pour l'instant)
INSERT INTO public.pharmacies (nom, adresse, latitude, longitude, horaires, telephone) VALUES
('Pharmacie du Marché', '123 Rue du Marché, Cotonou', 6.3654, 2.4183, 'Lun-Sam: 8h-20h, Dim: 9h-18h', '+229 21 12 34 56'),
('Pharmacie Centrale', '456 Avenue de l''Indépendance, Porto-Novo', 6.4969, 2.6283, 'Lun-Ven: 8h-19h, Sam: 8h-16h', '+229 20 23 45 67'),
('Pharmacie de la Paix', '789 Boulevard St-Michel, Parakou', 9.3372, 2.6307, 'Lun-Sam: 7h30-21h, Dim: 10h-16h', '+229 23 34 56 78'),
('Pharmacie Moderne', '321 Carrefour Gbegamey, Cotonou', 6.3833, 2.4000, 'Lun-Sam: 8h-22h, Dim: 9h-19h', '+229 21 45 67 89'),
('Pharmacie de l''Espoir', '654 Rue de la République, Abomey-Calavi', 6.4515, 2.3566, 'Lun-Ven: 8h-18h, Sam: 8h-15h', '+229 21 56 78 90');

-- Insérer des stocks d'exemple
WITH pharmacy_ids AS (
    SELECT id, nom FROM public.pharmacies
),
medicament_ids AS (
    SELECT id, nom FROM public.medicaments
)
INSERT INTO public.stocks (pharmacie_id, medicament_id, prix, quantite, disponible)
SELECT 
    p.id,
    m.id,
    CASE m.nom
        WHEN 'Paracétamol' THEN 250.00 + (RANDOM() * 100)::DECIMAL(10,2)
        WHEN 'Ibuprofène' THEN 300.00 + (RANDOM() * 150)::DECIMAL(10,2)
        WHEN 'Amoxicilline' THEN 800.00 + (RANDOM() * 200)::DECIMAL(10,2)
        WHEN 'Doliprane' THEN 350.00 + (RANDOM() * 100)::DECIMAL(10,2)
        WHEN 'Aspirine' THEN 200.00 + (RANDOM() * 80)::DECIMAL(10,2)
        WHEN 'Efferalgan' THEN 400.00 + (RANDOM() * 120)::DECIMAL(10,2)
        WHEN 'Spasfon' THEN 450.00 + (RANDOM() * 150)::DECIMAL(10,2)
        WHEN 'Smecta' THEN 500.00 + (RANDOM() * 100)::DECIMAL(10,2)
    END as prix,
    FLOOR(RANDOM() * 50 + 1)::INTEGER as quantite,
    CASE WHEN RANDOM() > 0.1 THEN true ELSE false END as disponible
FROM pharmacy_ids p
CROSS JOIN medicament_ids m
WHERE RANDOM() > 0.2; -- 80% de chance d'avoir le médicament dans chaque pharmacie