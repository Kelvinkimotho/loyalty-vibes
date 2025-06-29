import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://chznfjglrqyabfkadcgz.supabase.co',
  'enter your-supabase-anon-key-here'
)

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('customerTableBody')
  if (!tbody) {
    console.error('Table body not found.')
    return
  }

  const { data, error } = await supabase
    .from('visits')
    .select('phone, visit_time')
    .order('visit_time', { ascending: false })

  if (error) {
    console.error('Error loading visits:', error)
    return
  }

  // Group visits by phone number
  const visitsByPhone = {}
  data.forEach(visit => {
    const phone = visit.phone
    if (!visitsByPhone[phone]) visitsByPhone[phone] = []
    visitsByPhone[phone].push(new Date(visit.visit_time))
  })

  // Populate the table
  Object.entries(visitsByPhone).forEach(([phone, visits]) => {
    const total = visits.length
    const lastVisit = visits[0].toISOString().split('T')[0]
    const eligible = total >= 5
    const rewarded = total >= 10


    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${phone}</td>
      <td>${total}</td>
      <td>${lastVisit}</td>
      <td>${eligible ? (rewarded ? '🎁 Rewarded' : '🎯 Eligible') : '❌ Not Yet'}</td>

      <td>
        <button class="btn btn-success btn-sm" ${eligible ? '' : 'disabled'}>
          Redeem Reward
        </button>
      </td>
    `
    
    tbody.appendChild(tr)
  })
})

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return console.error("Failed to fetch subscriptions:", error)

  const tbody = document.getElementById('subsTableBody')
  data.forEach(sub => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${sub.phone_number}</td>
      <td>${sub.plan}</td>
      <td>${new Date(sub.created_at).toLocaleString()}</td>
    `
    tbody.appendChild(tr)
  })
})

