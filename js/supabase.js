// supabase.js
export const SUPABASE_CONFIG = {
  url: 'https://ubctxumyjegaudwfkydk.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViY3R4dW15amVnYXVkd2ZreWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDc5MzIsImV4cCI6MjA2Mzc4MzkzMn0.TUasJ1_1ntbgxKrus9ogbVMkwJYNT0160K4FVV0MBXk'
};

export const supabase = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.key
);
