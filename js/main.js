 // Main logic: Check user, log visit, reward logic

document.getElementById('phoneForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const phoneInput = document.getElementById('phoneNumber');
  const phoneNumber = phoneInput.value.trim();

  if (!phoneNumber.match(/^\+?\d{7,15}$/)) {
    alert('Please enter a valid phone number including country code.');
    return;
  }

  // Check if user exists
  let { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .limit(1);

  if (error) {
    alert('Error fetching user data');
    return;
  }

  let userId;
  if (users.length === 0) {
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ phone_number: phoneNumber }])
      .select()
      .single();

    if (createError) {
      alert('Error creating user');
      return;
    }

    userId = newUser.id;
  } else {
    userId = users[0].id;
  }

  // Log visit
  const { error: visitError } = await supabase
    .from('visits')
    .insert([{ user_id: userId }]);

  if (visitError) {
    alert('Error logging visit');
    return;
  }

  // Count visits
  const { data: visits, error: countError } = await supabase
    .from('visits')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (countError) {
    alert('Error counting visits');
    return;
  }

  const visitCount = visits.length;

  // Redirect with query params
  if (visitCount % 5 === 0) {
    // Reward unlocked
    window.location.href = `reward.html?phone=${encodeURIComponent(phoneNumber)}&visits=${visitCount}`;
  } else {
    // Show summary
    window.location.href = `summary.html?phone=${encodeURIComponent(phoneNumber)}&visits=${visitCount}`;
  }
});

