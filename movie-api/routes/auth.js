import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    isAdmin: req.user.app_metadata?.is_admin === true,
  });
});

export default router;
