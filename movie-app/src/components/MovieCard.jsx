import MoviePoster from "./MoviePoster.jsx";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";

function MovieCard({ movie, isAdmin, handleEdit, handleDelete, isDeleting }) {
  return (
    <article className="group grid grid-cols-1 items-start gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6 sm:p-6">
      <MoviePoster movie={movie} />
      <div className="min-w-0">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-6">
        <h3 className="min-w-0 wrap-anywhere text-lg font-bold sm:text-2xl tracking-tight"><Link to={`/movies/${movie.id}`}>{movie.title}</Link></h3>
        <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs sm:text-sm text-slate-600">
          {movie.releaseYear}
        </span>
      </div>
      <p className="wrap-anywhere mt-2 sm:mt-4 text-sm sm:text-base text-slate-500">감독 · {movie.director}</p>
      <p className="wrap-anywhere mt-4 sm:mt-6 border-t border-slate-100 pt-4 sm:pt-6 text-sm sm:text-base leading-relaxed text-slate-700">
        {movie.overview}
      </p>
      {isAdmin && (
        <div className="mt-4 flex justify-end gap-1 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" onClick={() => handleEdit(movie.id)} disabled={isDeleting}
            aria-label={`${movie.title} 수정`} title="수정"
            className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40">
            <Pencil className="size-5" strokeWidth={1.7} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => handleDelete(movie)} disabled={isDeleting}
            aria-label={`${movie.title} 삭제`} title="삭제"
            className="cursor-pointer rounded-lg p-2 text-red-600 hover:bg-red-50 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40">
            <Trash2 className="size-5" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>
      )}
      </div>
    </article>
  );
}

export default MovieCard;
