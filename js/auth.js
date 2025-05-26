const supabase = window.supabase;

async function getOrCreateUserByPhone(phone) {
  if (!phone) {
    throw new Error("Phone number is required.");
  }

  // Check if user exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phone)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // If not, create new user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({ phone_number: phone })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newUser;
}
