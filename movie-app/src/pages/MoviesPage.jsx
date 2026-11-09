import { apiUrl, getAuthHeaders } from "../api.js";
import { useEffect, useState } from "react";

import MovieCreate from "../components/MovieCreate.jsx";
import MovieEdit from "../components/MovieEdit.jsx";
import MovieList from "../components/MovieList.jsx";

function MoviesPage({ isAdmin = false }) {
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("id_asc");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [editingMovieId, setEditingMovieId] = useState(null);

  async function handleCreated() {
    setDeleteError("");
    await searchMovies(keyword, sort);
  }

  function handleEdit(movieId) {
    if (!isAdmin || isLoading || isDeleting) return;
    setEditingMovieId(movieId);
  }

  function handleCancel() {
    setEditingMovieId(null);
  }

  async function handleUpdated() {
    setEditingMovieId(null);
    await searchMovies(keyword, sort);
  }

  async function handleDelete(movie) {
    if (!isAdmin || isLoading || isDeleting) return;
    const confirmed = window.confirm(`"${movie.title}" 영화를 삭제하시겠습니까?`);
    if (!confirmed) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`${apiUrl}/api/movies/${movie.id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        setDeleteError(data.error || data.message || "영화를 삭제하지 못했습니다.");
        return;
      }
      setKeyword("");
      await searchMovies("", sort);
    } catch (error) {
      console.error("영화 삭제 처리 중 오류:", error);
      setDeleteError(error.message || "처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleChange(event) {
    setKeyword(event.target.value);
  }

  function handleSearch(event) {
    event.preventDefault();
    if (isLoading || isDeleting) return;
    setDeleteError("");

    const searchKeyword = keyword.trim();
    searchMovies(searchKeyword, sort);
  }

  useEffect(() => {
    async function fetchMovies() {
      try {
        const url = `${apiUrl}/api/movies`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("영화 목록을 불러오지 못했습니다.");
        }

        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("영화 목록 요청 실패:", error);
        setError("영화 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, []);

  async function searchMovies(searchKeyword, selectedSort) {
    searchKeyword = searchKeyword.trim();
    setIsLoading(true);
    setError("");

    try {
      const encodedKeyword = encodeURIComponent(searchKeyword);
      const encodedSort = encodeURIComponent(selectedSort);
      const url = `${apiUrl}/api/movies?query=${encodedKeyword}&sort=${encodedSort}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("영화 목록을 불러오지 못했습니다.");
      }

      const data = await response.json();
      // 실습: 이 위치에 결과가 0건일 때 GA로 이벤트를 보내는 코드를 추가합니다.
      setMovies(data);
    } catch (error) {
      console.error("영화 검색 실패:", error);
      setError("영화 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isAdmin && editingMovieId !== null) {
    return <MovieEdit movieId={editingMovieId} handleUpdated={handleUpdated} handleCancel={handleCancel} />;
  }

  return (
    <>
      {isAdmin && <MovieCreate handleCreated={handleCreated} />}
      <div className="mb-9">
        <form className="flex flex-col items-stretch gap-2 sm:flex-row" onSubmit={handleSearch}>
          <input
            aria-label="영화 제목"
            className="min-w-0 w-full sm:flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-2 focus:outline-blue-600"
            type="text"
            placeholder="예: 인셉션, 어벤져스"
            value={keyword}
            onChange={handleChange}
            disabled={isLoading || isDeleting}
          />
          <select
            aria-label="영화 정렬 기준"
            className="appearance-none bg-[url('/chevron-down.svg')] bg-no-repeat bg-position-[right_1rem_center] bg-size-[1rem_1rem] w-full shrink-0 rounded-lg border border-slate-300 bg-white pl-4 pr-10 py-3 focus:outline-2 focus:outline-blue-600 sm:w-[190px]"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            disabled={isLoading || isDeleting}
          >
            <option value="id_asc">기본순</option>
            <option value="year_desc">개봉 연도 높은 순</option>
            <option value="year_asc">개봉 연도 낮은 순</option>
          </select>
          <button
            className="w-full sm:w-auto min-w-22 shrink-0 cursor-pointer disabled:cursor-not-allowed rounded-lg bg-slate-900 px-5 py-3 text-white hover:bg-slate-700 disabled:opacity-50"
            type="submit"
            disabled={isLoading || isDeleting}
          >
            {isLoading ? "검색 중…" : "검색"}
          </button>
        </form>
      </div>
      <p role="alert" className="mb-4 text-sm text-red-700">{deleteError}</p>
      <MovieList handleEdit={handleEdit} isAdmin={isAdmin} handleDelete={handleDelete} isDeleting={isDeleting} movies={movies} isLoading={isLoading} error={error} />
    </>
  );
}

export default MoviesPage;
