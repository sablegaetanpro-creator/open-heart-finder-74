import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Parse the request body
    const { ad_type, ad_unit_id, completed, reward_granted } = await req.json()

    // Validate required fields
    if (!ad_type || !['banner', 'interstitial', 'rewarded'].includes(ad_type)) {
      throw new Error('Invalid ad_type')
    }

    // Insert the ad view record
    const { data, error } = await supabaseClient
      .from('ad_views')
      .insert({
        user_id: user.id,
        ad_type,
        ad_unit_id,
        completed: completed || false,
        reward_granted: reward_granted || false
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // If this is a rewarded ad and it was completed, grant rewards
    if (ad_type === 'rewarded' && completed && reward_granted) {
      // Grant super likes or other rewards
      const { error: rewardError } = await supabaseClient
        .from('premium_features')
        .upsert({
          user_id: user.id,
          feature_type: 'super_likes',
          quantity: 1,
          is_active: true
        }, {
          onConflict: 'user_id,feature_type'
        })

      if (rewardError) {
        console.error('Error granting reward:', rewardError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: 'Ad view tracked successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error tracking ad view:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
