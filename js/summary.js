import { supabase } from './supabase.js'

window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const phone = urlParams.get('phone')

  if (!phone) {
    document.getElementById('visitCount').textContent = 'Phone not provided'
    return
  }

  document.getElementById('phoneNumberDisplay').textContent = phone

  //  Fetch user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('phone_number', phone)
    .single()

  if (userError || !user) {
    console.error('User lookup error:', userError)
    document.getElementById('visitCount').textContent = 'User not found'
    return
  }

  //  Count visits
  const { count, error: visitError } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (visitError) {
    console.error('Visit count error:', visitError)
    document.getElementById('visitCount').textContent = 'Error fetching visits'
    return
  }

  const visits = count || 0
  document.getElementById('visitCount').textContent = visits

  const progressToNextReward = visits % 5
  const nextReward = progressToNextReward === 0 && visits !== 0 ? 0 : 5 - progressToNextReward
  const progressPercent = progressToNextReward * 20

  document.getElementById('nextReward').textContent = nextReward
  const progressBar = document.getElementById('progressBar')
  progressBar.style.width = `${progressPercent}%`
  progressBar.textContent = `${progressPercent}%`
})
