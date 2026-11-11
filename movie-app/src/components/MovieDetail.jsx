import MoviePoster from "./MoviePoster.jsx";
function MovieDetail({ movie }) {
  return (
    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-8">
      <MoviePoster movie={movie} />
      <div className="min-w-0">
      <h2 className="wrap-anywhere text-xl font-bold">
        {movie.title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {movie.releaseYear} · {movie.director}
      </p>
      <p className="wrap-anywhere mt-4 border-t border-slate-100 pt-4 leading-relaxed">
        {movie.overview}
      </p>
    </div>
    </div>
  );
}

export default MovieDetail;
