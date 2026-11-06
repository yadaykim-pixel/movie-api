import { supabase } from "./supabase.js";

export const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export async function getAuthHeaders() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error("로그인이 필요합니다.");
  return { Authorization: `Bearer ${session.access_token}` };
}
