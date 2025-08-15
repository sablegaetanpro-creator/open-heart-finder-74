import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  feature: 'premium' | 'super_likes' | 'boost' | 'reveal_likes'
  plan: string
  amount: number
  payment_method: 'card' | 'paypal' | 'mobile'
  payment_provider_id?: string
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
    const { feature, plan, amount, payment_method, payment_provider_id }: PaymentRequest = await req.json()

    // Validate required fields
    if (!feature || !['premium', 'super_likes', 'boost', 'reveal_likes'].includes(feature)) {
      throw new Error('Invalid feature')
    }

    if (!plan || !amount || amount <= 0) {
      throw new Error('Invalid plan or amount')
    }

    if (!payment_method || !['card', 'paypal', 'mobile'].includes(payment_method)) {
      throw new Error('Invalid payment method')
    }

    // Create the purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('user_purchases')
      .insert({
        user_id: user.id,
        feature,
        plan,
        amount,
        payment_method,
        payment_provider_id,
        status: 'completed', // Assuming payment is already processed
        expires_at: getExpirationDate(feature, plan)
      })
      .select()
      .single()

    if (purchaseError) {
      throw purchaseError
    }

    // Add the premium feature to the user's account
    const { error: featureError } = await supabaseClient
      .from('premium_features')
      .upsert({
        user_id: user.id,
        feature_type: feature,
        quantity: getFeatureQuantity(feature, plan),
        expires_at: getExpirationDate(feature, plan),
        is_active: true
      }, {
        onConflict: 'user_id,feature_type'
      })

    if (featureError) {
      console.error('Error adding premium feature:', featureError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: purchase,
        message: 'Payment processed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing payment:', error)
    
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

function getExpirationDate(feature: string, plan: string): string | null {
  const now = new Date()
  
  switch (plan) {
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    case 'yearly':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
    case 'lifetime':
      return null
    default:
      // For consumable features like super_likes, no expiration
      return null
  }
}

function getFeatureQuantity(feature: string, plan: string): number {
  switch (feature) {
    case 'super_likes':
      switch (plan) {
        case 'basic': return 5
        case 'premium': return 15
        case 'unlimited': return 999
        default: return 5
      }
    case 'boost':
      switch (plan) {
        case 'basic': return 1
        case 'premium': return 3
        case 'unlimited': return 999
        default: return 1
      }
    case 'premium':
    case 'reveal_likes':
      return 1
    default:
      return 1
  }
}
