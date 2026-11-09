import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("환경 변수 SUPABASE_URL과 SUPABASE_SECRET_KEY를 확인해 주세요.");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
);
