const supabase = window.supabase;

async function showLatestReward() {
  const phone = new URLSearchParams(window.location.search).get('phone');

  if (!phone) {
    document.getElementById('reward-name').textContent = "Phone number missing.";
    return;
  }

  // 1. Get the user by phone
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('phone_number', phone)
    .single();

  if (userError || !user) {
    document.getElementById('reward-name').textContent = "User not found.";
    return;
  }

  // 2. Get latest reward
  const { data: rewards, error: rewardError } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (rewardError || rewards.length === 0) {
    document.getElementById('reward-name').textContent = "No reward found.";
    return;
  }

  const latestReward = rewards[0];
  document.getElementById('reward-name').textContent =
    `Reward unlocked on ${new Date(latestReward.created_at).toLocaleDateString()} 🎁`;
}

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get('phone');
  const visits = urlParams.get('visits');

  const historyLink = document.getElementById('history-link');
  if (historyLink) {
    historyLink.href = `history.html?phone=${encodeURIComponent(phone)}&visits=${visits}&from=reward`;
  }

  showLatestReward();
});
