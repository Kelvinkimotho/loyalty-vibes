import { supabase } from './supabase.js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


// Pricing Configuration
const PRICING_PLANS = {
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

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('checkin-form')
  const phoneInput = document.getElementById('phone')
  const qrContainer = document.getElementById('qr-container')
  const qrCanvas = document.getElementById('qr-code')
  const errorBox = document.getElementById('error')
  const pricingContainer = document.getElementById('pricing-container')
  const successBox = document.getElementById('success') || document.createElement('div')

  if (!form || !phoneInput) return

  const iti = window.intlTelInput(phoneInput, {
    initialCountry: 'ke',
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    errorBox.classList.add('d-none')

    const phone = iti.getNumber().trim()
    if (!phone) return showError('Invalid phone number.')

    const { data: upsertedUser, error: upsertError } = await supabase
      .from('users')
      .upsert({ phone_number: phone }, { onConflict: 'phone_number' })
      .select('id')
      .single()

    if (upsertError || !upsertedUser) return showError('User save failed.')

    const userId = upsertedUser.id

    const { error: visitError } = await supabase
      .from('visits')
      .insert([{ user_id: userId, phone }])

    if (visitError) return showError('Visit save failed.')

    const { data: visits, error: visitFetchError } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId)

    if (visitFetchError || !visits) return showError('Failed to fetch visit count.')

    const visitCount = visits.length
    const rewardEligible = visitCount % 5 === 0

    if (rewardEligible) {
      const { error: rewardError } = await supabase
        .from('rewards')
        .insert([{ user_id: userId }])

      if (rewardError) return showError('Failed to save reward.')

      window.location.href = `reward.html?phone=${encodeURIComponent(phone)}&visits=${visitCount}`
    } else {
      const left = 5 - (visitCount % 5)
      document.getElementById('visits-left').textContent = `${left}`
      showModal('waitModal')
    }

    generateQR(phone)
  })

  function generateQR(text) {
    qrContainer.classList.remove('d-none')
    QRCode.toCanvas(qrCanvas, text, { width: 180 }, (err) => {
      if (err) showError('QR generation error')
    })
  }

  function showModal(id) {
    const modal = new bootstrap.Modal(document.getElementById(id))
    modal.show()
  }

  function showError(msg) {
    errorBox.textContent = msg
    errorBox.classList.remove('d-none')
  }

  function showSuccess(msg) {
    successBox.textContent = msg
    successBox.classList.remove('d-none')
  }

  function renderPricingPlans() {
    if (!pricingContainer) return
    pricingContainer.innerHTML = Object.entries(PRICING_PLANS).map(([plan, details]) => `
      <div class="col-md-4 ${plan === 'Premium Add-on' ? 'mt-4 mt-md-0' : ''}">
        <div class="card shadow-sm">
          <div class="card-header text-center ${plan === 'Basic Plan' ? 'bg-primary' : 'bg-success'} text-white">
            ${plan}
          </div>
          <div class="card-body text-center">
            <h3>KES ${details.price}/${details.interval}</h3>
            <ul class="list-unstyled mt-3 mb-4">
              ${details.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <button class="btn btn-outline-${plan === 'Basic Plan' ? 'primary' : 'success'} subscribe-btn" data-plan="${plan}">
              ${plan === 'Basic Plan' ? 'Subscribe Now' : 'Add to Plan'}
            </button>
            ${plan === 'Premium Add-on' ? `
              <button class="btn btn-sm btn-danger cancel-btn mt-2" data-plan="Basic Plan">Cancel</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('')
  }

  async function handleSubscription(plan) {
    const phone = iti.getNumber().trim()
    if (!phone) return showError('Please enter a valid phone number.')

    try {
      const amount = PRICING_PLANS[plan].price
      const response = await fetch('http://localhost:3005/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, plan, amount })
      })

      const result = await response.json()

      if (result.url) {
        await supabase.from('subscriptions').upsert({
          phone_number: phone,
          plan,
          status: 'pending',
          payment_method: 'stripe'
        }, { onConflict: 'phone_number' })

        const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY')
        await stripe.redirectToCheckout({ sessionId: result.sessionId })
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      showError(error.message)
    }
  }

  async function handleCancelSubscription(plan) {
    const phone = iti.getNumber().trim()
    if (!phone) return showError('Please enter a valid phone number.')

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('phone_number', phone)
        .eq('plan', plan)

      if (error) throw error
      showSuccess(`Successfully unsubscribed from ${plan}`)
    } catch (error) {
      console.error('Cancellation error:', error)
      showError('Failed to cancel subscription')
    }
  }

  function initializePricing() {
    renderPricingPlans()
    pricingContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('subscribe-btn')) {
        const plan = e.target.dataset.plan
        handleSubscription(plan)
      } else if (e.target.classList.contains('cancel-btn')) {
        const plan = e.target.dataset.plan
        handleCancelSubscription(plan)
      }
    })
  }

  initializePricing()
})
