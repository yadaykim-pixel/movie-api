import { authClient } from "../authClient.js";

export async function requireAuth(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get("Authorization") ?? "");
  if (!match) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  try {
    const { data: { user }, error } = await authClient.auth.getUser(match[1]);

    if (error) {
      const invalidTokenCodes = ["bad_jwt", "session_not_found", "user_not_found", "session_expired"];
      if ([401, 403].includes(error.status) || invalidTokenCodes.includes(error.code)) {
        return res.status(401).json({ error: "로그인 정보를 확인해 주세요." });
      }
      console.error("사용자 검증 서비스 오류:", error.status ?? "연결 실패");
      return res.status(503).json({ error: "사용자를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    }

    if (!user) {
      return res.status(401).json({ error: "로그인 정보를 확인해 주세요." });
    }

    req.user = user;
    next();
  } catch {
    console.error("사용자 검증 요청 실패");
    res.status(503).json({ error: "사용자를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." });
  }
}
