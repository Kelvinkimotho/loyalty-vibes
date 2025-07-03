export const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY') 

export const PRICING_PLANS = {
  'Basic Plan': {
    price: 200,
    interval: 'month',
    features: [
      '✔️ Loyalty Tracking',
      '✔️ QR Code Check-ins',
      '✔️ Admin Dashboard'
    ]
  },
  'Premium Add-on': {
    price: 100,
    interval: 'one-time',
    features: [
      '🎫 Branded QR Code',
      '📲 SMS Marketing Integration',
      'Priority Support'
    ]
  }
}

export async function handleStripeCheckout(phone, plan) {
  const amount = PRICING_PLANS[plan].price
  const response = await fetch('http://localhost:3005/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, plan, amount })
  })
  
  const result = await response.json()
  
  if (!result.url) {
    throw new Error('Failed to create checkout session')
  }
  
  return result
}

export async function cancelSubscription(phone, plan) {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('phone_number', phone)
    .eq('plan', plan)

  if (error) throw error
  
  return { success: true, message: `Unsubscribed from ${plan}` }
}