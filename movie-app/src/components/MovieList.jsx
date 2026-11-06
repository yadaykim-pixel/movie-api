import MovieCard from "./MovieCard.jsx";

function MovieList({ movies, isLoading, error, isAdmin, handleEdit, handleDelete, isDeleting }) {
  if (isLoading) {
    return <p className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-slate-500">영화 정보를 불러오는 중입니다...</p>;
  }

  if (error) {
    return <p className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-red-700" role="alert">{error}</p>;
  }

  if (movies.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-slate-500">검색 결과가 없습니다.</p>;
  }

  return (
    <section className="flex flex-col gap-4">
      {movies.map((movie) => (
        <MovieCard handleEdit={handleEdit} isAdmin={isAdmin} handleDelete={handleDelete} isDeleting={isDeleting} key={movie.id} movie={movie} />
      ))}
    </section>
  );
}

export default MovieList;
