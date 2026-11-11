import express from "express";
import { supabase } from "../supabase.js";
import { redis } from "../redis.js";
import { invalidateMovieLists } from "../cache.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const keyword =
    typeof req.query.query === "string"
      ? req.query.query.trim()
      : "";

  const sort = req.query.sort === undefined
    ? "id_asc"
    : req.query.sort;

  let column;
  let ascending;

  if (sort === "id_asc") {
    column = "id";
    ascending = true;
  } else if (sort === "year_desc") {
    column = "releaseYear";
    ascending = false;
  } else if (sort === "year_asc") {
    column = "releaseYear";
    ascending = true;
  } else {
    res.status(400).json({
      message: "정렬 기준은 id_asc, year_desc, year_asc 중 하나로 보내 주세요.",
    });
    return;
  }

  const cacheKey =
    `movies:list:query=${encodeURIComponent(keyword)}:sort=${sort}`;

  if (redis.isReady) {
    try {
      const cached = await redis.get(cacheKey);

      if (cached !== null) {
        const movies = JSON.parse(cached);
        console.log("[CACHE HIT]", cacheKey);
        res.status(200).json(movies);
        return;
      }

      console.log("[CACHE MISS]", cacheKey);
    } catch (error) {
      console.error("캐시 조회 처리 실패:", error.message);
    }
  }

  try {
    console.log("[DB 조회]", keyword, sort);
    const { data, error } = await supabase
      .from("movies")
      .select("id, title, director, releaseYear, overview, poster_path")
      .ilike("title", `%${keyword}%`)
      .order(column, {
        ascending: ascending,
      });

    if (error) {
      throw error;
    }

    if (redis.isReady) {
      try {
        await redis.set(cacheKey, JSON.stringify(data), { EX: 60 });
      } catch (error) {
        console.error("캐시 저장 실패:", error.message);
      }
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("영화 목록 처리 중 예외 발생:", error);
    res.status(500).json({ message: "영화 목록을 불러오지 못했습니다." });
  }
});

router.get("/:id", async (req, res) => {
  const movieId = Number(req.params.id);

  if (
    !Number.isSafeInteger(movieId) ||
    movieId <= 0 ||
    movieId > 2147483647
  ) {
    res.status(400).json({
      message: "영화 ID는 1 이상 2147483647 이하의 정수로 입력해 주세요.",
    });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("movies")
      .select("id, title, director, releaseYear, overview, poster_path")
      .eq("id", movieId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data === null) {
      res.status(404).json({ message: "영화를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("영화 상세 처리 중 예외 발생:", error);
    res.status(500).json({ message: "영화 정보를 불러오지 못했습니다." });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ message: "영화 정보를 JSON 객체로 보내 주세요." });
    return;
  }

  const title = body.title;
  const director = body.director;
  const releaseYear = body.releaseYear;
  const overview = body.overview;

  if (typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ message: "영화 제목을 입력해 주세요." });
    return;
  }

  if (title.trim().length > 50) {
    res.status(400).json({ message: "영화 제목은 50자 이하로 입력해 주세요." });
    return;
  }

  if (typeof director !== "string" || director.trim() === "") {
    res.status(400).json({ message: "감독을 입력해 주세요." });
    return;
  }

  if (!Number.isSafeInteger(releaseYear) || releaseYear <= 0 || releaseYear > 2147483647) {
    res.status(400).json({ message: "개봉 연도는 1 이상 2147483647 이하의 정수인 숫자로 보내 주세요." });
    return;
  }

  if (typeof overview !== "string" || overview.trim() === "") {
    res.status(400).json({ message: "줄거리를 입력해 주세요." });
    return;
  }

  const newMovie = {
    title: title.trim(),
    director: director.trim(),
    releaseYear: releaseYear,
    overview: overview.trim(),
  };

  try {
    const { data, error } = await supabase
      .from("movies")
      .insert(newMovie)
      .select("id, title, director, releaseYear, overview, poster_path")
      .single();

    if (error) {
      throw error;
    }

    await invalidateMovieLists();
    res.status(201).json(data);
  } catch (error) {
    console.error("영화 추가 처리 중 예외 발생:", error);
    res.status(500).json({ message: "영화를 추가하지 못했습니다." });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const movieId = Number(req.params.id);

  if (
    !Number.isSafeInteger(movieId) ||
    movieId <= 0 ||
    movieId > 2147483647
  ) {
    res.status(400).json({
      message: "영화 ID는 1 이상 2147483647 이하의 정수로 입력해 주세요.",
    });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("movies")
      .delete()
      .eq("id", movieId)
      .select("id, poster_path")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data === null) {
      res.status(404).json({ message: "삭제할 영화를 찾을 수 없습니다." });
      return;
    }

    if (data.poster_path?.startsWith(`${movieId}/`)) {
      try {
        const { error: removeError } = await supabase.storage.from("movie-posters").remove([data.poster_path]);
        if (removeError) console.error("삭제된 영화의 파일 정리 실패:", data.poster_path, removeError.message);
      } catch (error) {
        console.error("삭제된 영화의 파일 정리 실패:", data.poster_path, error.message);
      }
    }
    await invalidateMovieLists();
    res.status(200).json(data);
  } catch (error) {
    console.error("영화 삭제 처리 중 예외 발생:", error);
    res.status(500).json({ message: "영화를 삭제하지 못했습니다." });
  }
});

function validateMovie(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { message: "영화 정보를 JSON 객체로 보내 주세요." };
  }

  const allowedFields = ["title", "director", "releaseYear", "overview"];
  const fields = Object.keys(body);

  if (fields.length === 0) {
    return { message: "수정할 정보를 보내 주세요." };
  }

  const hasUnknownField = fields.some(
    (field) => !allowedFields.includes(field)
  );
  if (hasUnknownField) {
    return { message: "수정할 수 없는 속성이 포함되어 있습니다." };
  }

  const changes = {};

  if (Object.hasOwn(body, "title")) {
    const title = body.title;
    if (typeof title !== "string" || title.trim() === "") {
      return { message: "영화 제목을 입력해 주세요." };
    }
    if (title.trim().length > 50) {
      return { message: "영화 제목은 50자 이하로 입력해 주세요." };
    }
    changes.title = title.trim();
  }

  if (Object.hasOwn(body, "director")) {
    const director = body.director;
    if (typeof director !== "string" || director.trim() === "") {
      return { message: "감독을 입력해 주세요." };
    }
    changes.director = director.trim();
  }

  if (Object.hasOwn(body, "releaseYear")) {
    const releaseYear = body.releaseYear;
    if (
      !Number.isSafeInteger(releaseYear) ||
      releaseYear <= 0 ||
      releaseYear > 2147483647
    ) {
      return {
        message: "개봉 연도는 1 이상 2147483647 이하의 정수인 숫자로 보내 주세요.",
      };
    }
    changes.releaseYear = releaseYear;
  }

  if (Object.hasOwn(body, "overview")) {
    const overview = body.overview;
    if (typeof overview !== "string" || overview.trim() === "") {
      return { message: "줄거리를 입력해 주세요." };
    }
    changes.overview = overview.trim();
  }

  return { changes };
}

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const movieId = Number(req.params.id);

  if (
    !Number.isSafeInteger(movieId) ||
    movieId <= 0 ||
    movieId > 2147483647
  ) {
    res.status(400).json({
      message: "영화 ID는 1 이상 2147483647 이하의 정수로 입력해 주세요.",
    });
    return;
  }

  const result = validateMovie(req.body);
  if (result.message) {
    res.status(400).json({ message: result.message });
    return;
  }
  const changes = result.changes;

  try {
    const { data, error } = await supabase
      .from("movies")
      .update(changes)
      .eq("id", movieId)
      .select("id, title, director, releaseYear, overview, poster_path")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data === null) {
      res.status(404).json({ message: "수정할 영화를 찾을 수 없습니다." });
      return;
    }

    await invalidateMovieLists();
    res.status(200).json(data);
  } catch (error) {
    console.error("영화 수정 처리 중 오류:", error);
    res.status(500).json({ message: "영화를 수정하지 못했습니다." });
  }
});

export default router;
