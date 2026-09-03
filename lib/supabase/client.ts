import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dweqoipzzvrsuavczdcq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseAnonKey && supabaseAnonKey !== 'your-supabase-anon-key-here' && supabaseAnonKey.length > 20
);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'dummy-key-for-initialization-when-pending',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
