// js/summary.js
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get('phone');
  const visits = urlParams.get('visits');

  // Update the text content of each relevant span
  document.getElementById('phoneNumberDisplay').textContent = phone;
  document.getElementById('visitCount').textContent = visits;

  const visitsNum = parseInt(visits, 10);
  const nextReward = 5 - (visitsNum % 5);

  document.getElementById('nextReward').textContent = nextReward;

  // Progress bar update
  const progressPercent = (visitsNum % 5) * 20;
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = `${progressPercent}%`;
  progressBar.textContent = `${progressPercent}%`;
});
