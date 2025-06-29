import { supabase } from './supabase.js'

async function showLatestReward(phone, visits) {
  if (!phone) {
    document.getElementById('reward-name').textContent = "📵 Phone number missing."
    return
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('phone_number', phone)
    .single()

  if (userError || !user) {
    document.getElementById('reward-name').textContent = "❌ User not found."
    return
  }

  // Insert reward only if visits is a multiple of 10
  if (visits && visits % 10 === 0) {
    const { error: insertError } = await supabase
      .from('rewards')
      .insert([{ user_id: user.id }])

    if (insertError) {
      document.getElementById('reward-name').textContent = "❌ Failed to insert reward."
      return
    }
  }

  // Get latest reward
  const { data: rewards, error: rewardError } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (rewardError || !rewards || rewards.length === 0) {
    document.getElementById('reward-name').textContent = "🎁 No reward found yet."
    return
  }

  const latestReward = rewards[0]
  const date = new Date(latestReward.created_at).toLocaleDateString()
  document.getElementById('reward-name').textContent = `🎉 Reward unlocked on ${date}`
}

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  let phone = urlParams.get('phone')
  let visits = urlParams.get('visits')

  // Ask user if values missing
  if (!phone) {
    phone = prompt("Enter your phone number:")
    if (phone) urlParams.set('phone', phone)
  }

  if (!visits) {
    visits = prompt("Enter your total visits:")
    if (visits) urlParams.set('visits', visits)
  }

  // Update history button link
  const historyLink = document.getElementById('history-link')
  if (historyLink && phone && visits) {
    historyLink.href = `history.html?phone=${encodeURIComponent(phone)}&visits=${visits}&from=reward`
  } else {
    historyLink.classList.add('disabled')
    historyLink.setAttribute('title', 'Missing visit data')
  }

  // Show reward
  showLatestReward(phone, parseInt(visits, 10))

  // Open admin after 2 seconds
  setTimeout(() => {
    window.open('admin.html', '_blank')
  }, 2000)
})
