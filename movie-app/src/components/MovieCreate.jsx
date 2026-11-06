import { apiUrl, getAuthHeaders } from "../api.js";
import { useState } from "react";
import MovieForm from "./MovieForm.jsx";

function MovieCreate({ handleCreated }) {
  const [form, setForm] = useState({
    title: "",
    director: "",
    releaseYear: "",
    overview: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    const newMovie = { ...form, releaseYear: Number(form.releaseYear) };
    try {
      const response = await fetch(`${apiUrl}/api/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...await getAuthHeaders() },
        body: JSON.stringify(newMovie),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.message || "영화를 추가하지 못했습니다.");
        return;
      }
      setForm({ title: "", director: "", releaseYear: "", overview: "" });
      await handleCreated();
    } catch (error) {
      console.error("영화 추가 처리 중 오류:", error);
      setError(error.message || "처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MovieForm
      form={form}
      setForm={setForm}
      error={error}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      submitLabel="추가"
    />
  );
}

export default MovieCreate;
