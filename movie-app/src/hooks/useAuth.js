import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";
import { apiUrl } from "../api.js";

export function useAuth() {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setIsAdmin(undefined);
      setSession(nextSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let ignore = false;

    async function checkAdmin() {
      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error("관리자 여부를 확인하지 못했습니다.");
        const data = await response.json();
        if (!ignore) {
          setIsAdmin(data.id === session.user.id && data.isAdmin === true);
        }
      } catch {
        if (!ignore) {
          setIsAdmin(false);
          alert("권한 확인 실패: 서버 연결을 확인하고 새로고침해 주세요.");
        }
      }
    }

    checkAdmin();
    return () => { ignore = true; };
  }, [session]);

  async function loginWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch {
      alert("Google 로그인을 시작하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch {
      alert("로그아웃하지 못했습니다. 다시 시도해 주세요.");
    }
  }

  return { session, isAdmin, loginWithGoogle, logout };
}
