import { apiUrl } from "../api.js";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import MovieDetail from "../components/MovieDetail.jsx";

function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMovie() {
      setIsLoading(true);
      setError("");
      setMovie(null);
      try {
        const movieId = Number(id);
        if (!Number.isSafeInteger(movieId) || movieId <= 0 || movieId > 2147483647) {
          setError("잘못된 영화 주소입니다.");
          return;
        }
        const url = `${apiUrl}/api/movies/${movieId}`;
        const response = await fetch(url);
        if (response.status === 400) {
          setError("잘못된 영화 주소입니다.");
          return;
        }
        if (response.status === 404) {
          setError("영화를 찾을 수 없습니다.");
          return;
        }
        if (!response.ok) {
          setError("영화 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
          return;
        }
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("영화 상세 요청 실패:", error);
        setError("영화 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovie();
  }, [id]);

  return (
    <>
      <Link to="/" className="mb-6 inline-block text-slate-600 underline">
        목록으로 돌아가기
      </Link>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        {isLoading && (
          <p>영화 정보를 불러오는 중입니다...</p>
        )}
        {!isLoading && error && (
          <p className="text-red-700" role="alert">
            {error}
          </p>
        )}
        {!isLoading && !error && movie && (
          <MovieDetail movie={movie} />
        )}
      </section>
    </>
  );
}

export default MovieDetailPage;
