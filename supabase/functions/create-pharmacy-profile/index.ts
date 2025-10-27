import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    console.log('Nouvel utilisateur créé:', record)

    // Extraire les données de géolocalisation des métadonnées
    const latitude = record.raw_user_meta_data?.latitude
    const longitude = record.raw_user_meta_data?.longitude

    if (latitude && longitude) {
      // Créer le profil de pharmacie avec la position GPS
      const { error: profileError } = await supabaseClient
        .from('pharmacies')
        .insert({
          user_id: record.id,
          nom: `Pharmacie ${record.email.split('@')[0]}`, // Nom temporaire basé sur l'email
          adresse: 'Adresse à compléter',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          horaires: '8h-18h (à modifier)',
          telephone: 'À compléter'
        })

      if (profileError) {
        console.error('Erreur création profil pharmacie:', profileError)
        throw profileError
      }

      console.log('Profil pharmacie créé avec succès avec position GPS')
    } else {
      console.log('Position GPS non disponible dans les métadonnées')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})