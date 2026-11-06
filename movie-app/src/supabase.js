import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  throw new Error("movie-app/.env의 Supabase URL과 Publishable Key를 입력한 뒤 재시작해 주세요.");
}

export const supabase = createClient(url, key);
