export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  if (req.user.app_metadata?.is_admin !== true) {
    return res.status(403).json({ error: "관리자만 사용할 수 있습니다." });
  }

  next();
}
