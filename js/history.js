const supabase = window.supabase;

async function loadHistory() {
  const phone = new URLSearchParams(window.location.search).get('phone');

  if (!phone) {
    alert("Phone number is missing.");
    return;
  }

  document.getElementById('phoneDisplay').textContent = phone;

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('phone_number', phone)
    .single();

  if (userError || !user) {
    alert("User not found.");
    return;
  }

  // Fetch visits
  const { data: visits } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const visitList = document.getElementById('visitList');
  visitList.innerHTML = '';

  if (!visits || visits.length === 0) {
    visitList.innerHTML = '<li class="list-group-item text-muted">No visits yet.</li>';
  } else {
    visits.forEach((visit, i) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `Visit #${visits.length - i} on ${new Date(visit.created_at).toLocaleString()}`;
      visitList.appendChild(li);
    });
  }

  // Fetch rewards
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const rewardList = document.getElementById('rewardList');
  rewardList.innerHTML = '';

  if (!rewards || rewards.length === 0) {
    rewardList.innerHTML = '<li class="list-group-item text-muted">No rewards earned yet.</li>';
  } else {
    rewards.forEach((reward, i) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `Reward #${rewards.length - i} on ${new Date(reward.created_at).toLocaleString()}`;
      rewardList.appendChild(li);
    });
  }

  // Build monthly summary data
  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString('default', { month: 'short' })
  );

  const visitsPerMonth = Array(12).fill(0);
  const rewardsPerMonth = Array(12).fill(0);

  visits.forEach(v => {
    const month = new Date(v.created_at).getMonth();
    visitsPerMonth[month]++;
  });

  rewards.forEach(r => {
    const month = new Date(r.created_at).getMonth();
    rewardsPerMonth[month]++;
  });

  const ctx = document.getElementById('summaryChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'Visits',
          backgroundColor: '#0d6efd',
          data: visitsPerMonth
        },
        {
          label: 'Rewards',
          backgroundColor: '#198754',
          data: rewardsPerMonth
        }
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
  });
}

// Page loaded
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const phone = params.get('phone');
  const visits = params.get('visits');
  const from = params.get('from');

  const backButton = document.getElementById('back-button');
  if (backButton && from === 'reward') {
    backButton.addEventListener('click', () => {
      window.location.href = `reward.html?phone=${encodeURIComponent(phone)}&visits=${visits}`;
    });
  }

  loadHistory();
});
