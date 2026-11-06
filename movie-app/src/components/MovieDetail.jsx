function MovieDetail({ movie }) {
  return (
    <>
      <h2 className="wrap-anywhere text-xl font-bold">
        {movie.title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {movie.releaseYear} · {movie.director}
      </p>
      <p className="wrap-anywhere mt-4 border-t border-slate-100 pt-4 leading-relaxed">
        {movie.overview}
      </p>
    </>
  );
}

export default MovieDetail;
