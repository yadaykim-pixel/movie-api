import { apiUrl, getAuthHeaders } from "../api.js";
import { useState } from "react";
import MovieForm from "./MovieForm.jsx";
import { uploadMoviePoster } from "../uploadMoviePoster.js";

function MovieCreate({ handleCreated }) {
  const [form, setForm] = useState({ title: "", director: "", releaseYear: "", overview: "" });
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleComplete() {
    await handleCreated();
    setForm({ title: "", director: "", releaseYear: "", overview: "" });
    setFile(null);
    setUploadError("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    if (file && !["image/png", "image/jpeg"].includes(file.type)) {
      setError("PNG 또는 JPEG를 선택해 주세요.");
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      setError("파일은 약 2MB 이하로 선택해 주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...await getAuthHeaders() },
        body: JSON.stringify({ ...form, releaseYear: Number(form.releaseYear) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "영화를 추가하지 못했습니다.");
      if (file) {
        try {
          await uploadMoviePoster(data.id, file);
        } catch (error) {
          setUploadError("영화는 생성되었지만 이미지 업로드에 실패했습니다.");
          return;
        }
      }
      await handleComplete();
    } catch (error) {
      setError(error.message || "처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (uploadError) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p role="alert" className="text-sm text-red-700">{uploadError}</p>
        <button type="button" onClick={handleComplete} className="mt-4 cursor-pointer rounded-lg border border-slate-300 px-4 py-2">목록으로 돌아가기</button>
      </section>
    );
  }

  return (
    <MovieForm form={form} setForm={setForm} error={error}
      isSubmitting={isSubmitting} handleSubmit={handleSubmit} submitLabel="추가">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        포스터 이미지 (선택)
        <input type="file" accept="image/png,image/jpeg"
          onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <span className="text-slate-500">(2MB 이하 PNG 또는 JPEG)</span>
      </label>
    </MovieForm>
  );
}

export default MovieCreate;
