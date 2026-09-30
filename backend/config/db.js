import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qkrswbisbchznjgvzrwm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcnN3YmlzYmNoem5qZ3Z6cndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyOTgzNTAsImV4cCI6MjEwMDg3NDM1MH0.n798itOmhCSOwh87NnoOq4U-WA7A-WOyE8rO30kwhq0';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[DB] Missing SUPABASE_URL or SUPABASE_KEY in environment variables!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
