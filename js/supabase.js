// supabase.js
export const SUPABASE_CONFIG = {
  url: 'https://ubctxumyjegaudwfkydk.supabase.co',
  key: 'wwww'
};

export const supabase = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.key
);
