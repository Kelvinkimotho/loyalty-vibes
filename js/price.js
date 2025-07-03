
import { supabase } from './supabase.js'

const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY');
    
    const BACKEND_URL = 'http://localhost:3005'

    document.addEventListener('DOMContentLoaded', () => {
      const phoneInput = document.getElementById('phone')
      const errorBox = document.getElementById('error')
      const successBox = document.getElementById('success')
      const mpesaModal = new bootstrap.Modal(document.getElementById('mpesaModal'))
      
      if (!phoneInput) return

      const iti = window.intlTelInput(phoneInput, {
        initialCountry: 'ke',
        utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
      })

      const showError = msg => {
        errorBox.textContent = msg
        errorBox.classList.remove('d-none')
      }

      const showSuccess = msg => {
        successBox.textContent = msg
        successBox.classList.remove('d-none')
      }

      const hideMessages = () => {
        errorBox.classList.add('d-none')
        successBox.classList.add('d-none')
      }

      // Handle subscription with selected payment method
      document.querySelectorAll('.subscribe-btn').forEach(button => {
        button.addEventListener('click', async () => {
          const phone = iti.getNumber().trim()
          const plan = button.dataset.plan
          const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').id

          if (!phone || !plan) return showError('Enter phone number & select plan.')

          try {
            if (paymentMethod === 'mpesaMethod') {
              
              mpesaModal.show()
              
              const response = await fetch('http://localhost:3005/initiate-mpesa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  phone: phone,
                  amount: plan === 'Basic' ? 200 : 100,
                  plan
                  })

              })
              
              const result = await response.json()
              
              if (result.success) {
                
                const pollPayment = async (requestId) => {
                  const statusResponse = await fetch(`${BACKEND_URL}/check-mpesa-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestId })
                  })
                  
                  const status = await statusResponse.json()
                  
                  if (status.paid) {
                    document.getElementById('mpesaInstructions').classList.add('d-none')
                    document.getElementById('mpesaSuccess').classList.remove('d-none')
                    
                    const { error } = await supabase
                      .from('subscriptions')
                      .upsert({
                        phone_number: phone,
                        plan,
                        status: 'active',
                        payment_method: 'mpesa'
                      }, { onConflict: 'phone_number' })
                    
                    if (error) throw new Error('Subscription save failed')
                  } else if (status.failed) {
                    throw new Error('M-Pesa payment failed or was cancelled')
                  } else {
                    
                    setTimeout(() => pollPayment(requestId), 2000)
                  }
                }
                
                pollPayment(result.requestId)
              } else {
                throw new Error(result.error || 'M-Pesa payment initiation failed')
              }
            } else {
              
              const response = await fetch(`${BACKEND_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  phone, 
                  plan,
                  amount: plan === 'Basic Plan' ? 200 : 100
                })
              })

              const result = await response.json()
              
              if (result.url) {
                const { error } = await stripe.redirectToCheckout({
                  sessionId: result.sessionId
                })
                
                if (error) throw error
              } else {
                throw new Error('Stripe checkout failed')
              }
            }
          } catch (error) {
            console.error('Payment error:', error)
            if (paymentMethod === 'mpesaMethod') {
              document.getElementById('mpesaErrorMsg').textContent = error.message
              document.getElementById('mpesaInstructions').classList.add('d-none')
              document.getElementById('mpesaError').classList.remove('d-none')
            } else {
              showError(error.message)
            }
          }
        })
      })

      // Cancel Logic
      document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', async () => {
          hideMessages()

          const phone = iti.getNumber().trim()
          // const phone = iti.getNumber().trim() || '+254700000001'

          const plan = button.dataset.plan

          if (!phone) return showError("Please enter a valid phone number.")

          const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('phone_number', phone)
            .eq('plan', plan)

          if (error) return showError("❌ Cancellation failed.")
          showSuccess(`🚫 Unsubscribed from the ${plan}.`)
        })
      })
    })