// main.js
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkin-form');
  const phoneInput = document.getElementById('phone');
  const errorDiv = document.getElementById('error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phoneNumber = phoneInput.value.trim();
    if (!isValidPhoneNumber(phoneNumber)) {
      showError(errorDiv, 'Please enter a valid phone number (e.g. +254712345678)');
      return;
    }

    try {
      const userId = await handleUserWithRetry(supabase, phoneNumber);
      const visitCount = await handleVisitWithRetry(supabase, userId);
      redirectUser(phoneNumber, visitCount);
    } catch (error) {
      console.error('Error:', error);
      showError(errorDiv, 'An error occurred. Please try again.');
    }
  });
});

function isValidPhoneNumber(phone) {
  return /^\+?\d{7,15}$/.test(phone);
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('d-none');
}

function redirectUser(phoneNumber, visitCount) {
  const isRewardVisit = visitCount % 5 === 0;
  const page = isRewardVisit ? 'reward.html' : 'summary.html';
  window.location.href = `${page}?phone=${encodeURIComponent(phoneNumber)}&visits=${visitCount}`;
}

async function handleUserWithRetry(supabase, phoneNumber, maxAttempts = 3) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (error) throw error;
      if (user) return user.id;

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ phone_number: phoneNumber }])
        .select('id')
        .single();

      if (insertError) throw insertError;
      return newUser.id;
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) throw err;
      await new Promise(res => setTimeout(res, 500 * attempts));
    }
  }
}

async function handleVisitWithRetry(supabase, userId, maxAttempts = 3) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const { error } = await supabase
        .from('visits')
        .insert([{ user_id: userId }]);

      if (error) throw error;

      const { count, error: countError } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;

      return count;
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) throw err;
      await new Promise(res => setTimeout(res, 500 * attempts));
    }
  }
}
