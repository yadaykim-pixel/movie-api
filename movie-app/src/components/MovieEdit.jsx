import { apiUrl, getAuthHeaders } from "../api.js";
import { useEffect, useState } from "react";
import MovieForm from "./MovieForm.jsx";

function MovieEdit({ movieId, handleUpdated, handleCancel }) {
  const [form, setForm] = useState({
    title: "",
    director: "",
    releaseYear: "",
    overview: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function fetchMovie() {
      setIsLoading(true);
      setLoadError("");
      try {
        if (!Number.isSafeInteger(movieId) || movieId <= 0 || movieId > 2147483647) {
          setLoadError("잘못된 영화 주소입니다.");
          return;
        }
        const response = await fetch(`${apiUrl}/api/movies/${movieId}`);
        const data = await response.json();
        if (!response.ok) {
          setLoadError(data.error || data.message || "영화 정보를 불러오지 못했습니다.");
          return;
        }
        setForm({
          title: data.title,
          director: data.director,
          releaseYear: String(data.releaseYear),
          overview: data.overview,
        });
      } catch (error) {
        console.error("수정할 영화 조회 중 오류:", error);
        setLoadError("영화 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovie();
  }, [movieId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || isLoading || loadError) return;
    setIsSubmitting(true);
    setError("");
    const changes = { ...form, releaseYear: Number(form.releaseYear) };
    try {
      const response = await fetch(`${apiUrl}/api/movies/${movieId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...await getAuthHeaders() },
        body: JSON.stringify(changes),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || "영화를 수정하지 못했습니다.");
        return;
      }
      await handleUpdated();
    } catch (error) {
      console.error("영화 수정 처리 중 오류:", error);
      setError(error.message || "처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="py-8 text-center text-slate-500">영화 정보를 불러오는 중입니다...</p>;
  }
  if (loadError) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p role="alert" className="text-sm text-red-700">{loadError}</p>
        <button type="button" onClick={handleCancel} className="mt-4 cursor-pointer rounded-lg border border-slate-300 px-4 py-2">돌아가기</button>
      </section>
    );
  }

  return (
    <MovieForm
      form={form}
      setForm={setForm}
      error={error}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      submitLabel="저장"
    />
  );
}

export default MovieEdit;
