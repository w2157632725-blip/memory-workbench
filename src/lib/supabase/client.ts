import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseKey || !supabaseKey.startsWith('ey')) {
  console.warn('⚠️ Supabase API Key looks invalid. It should start with "ey" (JWT). Current key starts with:', supabaseKey?.substring(0, 5));
}

export const supabase = createClient(supabaseUrl, supabaseKey);
