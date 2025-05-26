// Admin dashboard logic

async function loadAdminData() {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, phone_number, created_at');

  if (usersError) {
    alert('Error loading users');
    return;
  }

  const tableBody = document.getElementById('usersTableBody');
  tableBody.innerHTML = '';

  for (const user of users) {
    // Fetch visit count
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select('id')
      .eq('user_id', user.id);

    if (visitsError) {
      alert('Error loading visits');
      return;
    }

    // Fetch reward count
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('id')
      .eq('user_id', user.id);

    if (rewardsError) {
      alert('Error loading rewards');
      return;
    }

    // Build table row with View History button
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.phone_number}</td>
      <td>${visits.length}</td>
      <td>${rewards.length}</td>
      <td>
        <a href="history.html?phone=${encodeURIComponent(user.phone_number)}" class="btn btn-sm btn-primary">
          View History
        </a>
      </td>
    `;
    tableBody.appendChild(row);
  }
}

window.addEventListener('DOMContentLoaded', loadAdminData);
