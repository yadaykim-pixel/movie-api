import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { invalidateMovieLists } from "../cache.js";

const router = express.Router();
const bucket = "movie-posters";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 },
});

function imageType(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    return { ext: "png", mime: "image/png" };
  }
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  return null;
}

async function removeFile(path) {
  if (!path) return;
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.error("포스터 파일 정리 실패:", path, error.message);
  } catch (error) {
    console.error("포스터 파일 정리 실패:", path, error.message);
  }
}

router.post("/:id/poster", requireAuth, requireAdmin, (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({ message: "올바른 영화 ID를 입력해 주세요." });
  }
  next();
}, upload.single("poster"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "포스터 파일을 선택해 주세요." });
  const type = imageType(req.file.buffer);
  if (!type) return res.status(400).json({ message: "PNG 또는 JPEG 이미지 파일만 사용할 수 있습니다." });
  const movieId = Number(req.params.id);
  const path = `${movieId}/${randomUUID()}.${type.ext}`;
  let uploaded = false;
  let committed = false;

  try {
    const { data: movie, error: readError } = await supabase
      .from("movies").select("id, poster_path").eq("id", movieId).maybeSingle();
    if (readError) throw readError;
    if (!movie) return res.status(404).json({ message: "영화를 찾을 수 없습니다." });

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, req.file.buffer, {
      contentType: type.mime,
      upsert: false,
    });
    if (uploadError) throw uploadError;
    uploaded = true;

    let query = supabase.from("movies").update({ poster_path: path }).eq("id", movieId);
    query = movie.poster_path === null
      ? query.is("poster_path", null)
      : query.eq("poster_path", movie.poster_path);
    const { data, error: updateError } = await query
      .select("id, title, director, releaseYear, overview, poster_path").maybeSingle();
    if (updateError) throw updateError;
    if (!data) {
      await removeFile(path);
      return res.status(409).json({ message: "영화 정보가 변경됐습니다. 새로고침 후 다시 시도해 주세요." });
    }
    committed = true;
    await invalidateMovieLists();
    if (movie.poster_path?.startsWith(`${movieId}/`)) await removeFile(movie.poster_path);
    res.status(200).json(data);
  } catch (error) {
    if (uploaded && !committed) await removeFile(path);
    console.error("포스터 업로드 실패:", error.message);
    res.status(500).json({ message: "포스터를 저장하지 못했습니다. 서버 로그를 확인해 주세요." });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "파일은 약 2MB 이하로 선택해 주세요." : "poster 필드에 이미지 파일 한 개를 보내 주세요.",
    });
  }
  next(error);
});

export default router;
