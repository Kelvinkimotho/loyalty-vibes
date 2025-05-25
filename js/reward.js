// Reward page logic

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get('phone');
  const visits = urlParams.get('visits');

  document.getElementById('phoneNumberDisplay').textContent = phone;
  document.getElementById('visitCount').textContent = visits;

  // Optional: Mark reward as unredeemed in the database (if you want)
});
 
