import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Initialize Supabase
const supabase = createClient(
  'https://chznfjglrqyabfkadcgz.supabase.co',
  'enter your-supabase-anon-key-here'
)

// Elements
const form = document.getElementById('checkin-form')
const phoneInput = document.getElementById('phone')
const qrContainer = document.getElementById('qr-container')
const qrCanvas = document.getElementById('qr-code')
const errorBox = document.getElementById('error')

// intl-tel-input setup
const iti = window.intlTelInput(phoneInput, {
  initialCountry: 'ke',
  utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  errorBox.classList.add('d-none')

  const phone = iti.getNumber().trim()
  if (!phone) return showError('Invalid phone number.')

  //  Upsert user
  const { data: upsertedUser, error: upsertError } = await supabase
    .from('users')
    .upsert({ phone_number: phone }, { onConflict: 'phone_number' })
    .select('id')
    .single()

  if (upsertError || !upsertedUser) return showError('User save failed.')

  const userId = upsertedUser.id

  // Insert visit
  const { error: visitError } = await supabase
    .from('visits')
    .insert([{ user_id: userId, phone }])

  if (visitError) return showError('Visit save failed.')

  // Get total visits for this user
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
}
 else {
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

