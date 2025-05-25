 // Summary page logic

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get('phone');
  const visits = urlParams.get('visits');

  document.getElementById('phoneNumberDisplay').textContent = phone;
  document.getElementById('visitCount').textContent = visits;

  const visitsNum = parseInt(visits, 10);
  const nextReward = 5 - (visitsNum % 5);

  document.getElementById('nextReward').textContent = nextReward;

  // Update progress bar
  const progressPercent = (visitsNum % 5) * 20; // 5 visits per reward → 20% per visit
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = `${progressPercent}%`;
  progressBar.textContent = `${progressPercent}%`;
});

