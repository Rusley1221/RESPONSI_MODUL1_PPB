import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[config] SUPABASE_URL / SUPABASE_KEY belum diset. Cek file .env atau Environment Variables di Vercel.');
}

export const supabase = createClient(SUPABASE_URL || 'http://localhost', SUPABASE_KEY || 'missing-key', {
  auth: { persistSession: false },
});
