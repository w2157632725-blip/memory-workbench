import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbazykmvvsmdohxesyzu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYXp5a212dnNtZG9oeGVzeXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjc1OTgsImV4cCI6MjA4MzgwMzU5OH0.N5UTlLuFdSw4j7e0NSOCbERGH6hThR5XaDMn6n3FoIM';

if (!supabaseKey || !supabaseKey.startsWith('ey')) {
  console.warn('⚠️ Supabase API Key looks invalid. It should start with "ey" (JWT). Current key starts with:', supabaseKey?.substring(0, 5));
}

export const supabase = createClient(supabaseUrl, supabaseKey);
