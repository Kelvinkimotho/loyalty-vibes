import { supabase } from './supabase.js'

async function loadHistory() {
  let phone = new URLSearchParams(window.location.search).get('phone')

  if (!phone) {
    phone = prompt("Please enter your phone number:")
    if (!phone) {
      alert("Phone number is required.")
      return
    }
    window.history.replaceState({}, '', `?phone=${encodeURIComponent(phone)}`)
  }

  console.log("📞 Phone number from URL or input:", phone)
  document.getElementById('phoneDisplay').textContent = phone

  // Get user by phone
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('phone_number', phone)
    .single()

  if (userError || !user) {
    console.error("❌ User lookup error:", userError)
    alert("User not found.")
    return
  }

  // Use existing timestamp column
  const { data: visits, error: visitError } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', user.id)
    .order('visit_time', { ascending: false }) 

  if (visitError) {
    console.error("⚠️ Error fetching visits:", visitError)
    return
  }

  const visitList = document.getElementById('visitList')
  visitList.innerHTML = visits?.length
    ? visits.map((v, i) =>
        `<li class="list-group-item">Visit #${visits.length - i} on ${new Date(v.visit_time).toLocaleString()}</li>`
      ).join('')
    : '<li class="list-group-item text-muted">No visits yet.</li>'

  const { data: rewards, error: rewardError } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) 

  if (rewardError) {
    console.error("⚠️ Error fetching rewards:", rewardError)
    return
  }

  const rewardList = document.getElementById('rewardList')
  rewardList.innerHTML = rewards?.length
    ? rewards.map((r, i) =>
        `<li class="list-group-item">Reward #${rewards.length - i} on ${new Date(r.created_at).toLocaleString()}</li>`
      ).join('')
    : '<li class="list-group-item text-muted">No rewards earned yet.</li>'

  // Monthly summary chart
  const visitsPerMonth = Array(12).fill(0)
  const rewardsPerMonth = Array(12).fill(0)
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString('default', { month: 'short' })
  )

  visits.forEach(v => {
    const month = new Date(v.visit_time).getMonth()
    visitsPerMonth[month]++
  })

  rewards.forEach(r => {
    const month = new Date(r.created_at).getMonth()
    rewardsPerMonth[month]++
  })

  const ctx = document.getElementById('summaryChart').getContext('2d')
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [
        { label: 'Visits', data: visitsPerMonth, backgroundColor: '#0d6efd' },
        { label: 'Rewards', data: rewardsPerMonth, backgroundColor: '#198754' }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Monthly Visits & Rewards' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  })

  console.log("✅ Visits:", visits)
  console.log("✅ Rewards:", rewards)
}

document.addEventListener('DOMContentLoaded', loadHistory)
