import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Initialize Supabase
const supabase = createClient(
  'https://chznfjglrqyabfkadcgz.supabase.co',
  'enter your-supabase-anon-key-here'
)

document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('phone')
  const errorBox = document.getElementById('error')
  const successBox = document.getElementById('success')

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

  // Subscribe Logic
  document.querySelectorAll('.subscribe-btn').forEach(button => {
    button.addEventListener('click', async () => {
      hideMessages()

      const phone = iti.getNumber().trim()
      const plan = button.dataset.plan

      if (!phone || !plan) {
        return showError('📱 Please enter a valid phone number and select a plan.')
      }

      const { data: existing, error: checkError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('phone_number', phone)
        .eq('plan', plan)

      if (checkError) return showError("Could not verify subscription. Try again.")

      if (existing && existing.length > 0) {
        return showError(`📌 You're already subscribed to the ${plan}.`)
      }

      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert([{ phone_number: phone, plan }])

      if (insertError) return showError("❌ Subscription failed. Please try again.")

      showSuccess(`✅ Subscribed to the ${plan}.`)

      setTimeout(() => {
        window.open('admin.html', '_blank') 
        }, 2000)
    })
  })

  // Cancel Logic
  document.querySelectorAll('.cancel-btn').forEach(button => {
    button.addEventListener('click', async () => {
      hideMessages()

      const phone = iti.getNumber().trim()
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
