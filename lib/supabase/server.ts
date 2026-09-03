import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dweqoipzzvrsuavczdcq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  supabaseServiceKey && supabaseServiceKey !== 'your-supabase-service-role-key-here' && supabaseServiceKey.length > 20
);

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceKey || 'dummy-key-for-server',
  {
    auth: {
      persistSession: false,
    },
  }
);
