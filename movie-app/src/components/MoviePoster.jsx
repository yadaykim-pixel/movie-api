import { supabase } from "../supabase.js";

export default function MoviePoster({ movie }) {
  if (!movie.poster_path) {
    return <div className="mx-auto flex aspect-[2/3] w-36 sm:w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">포스터 없음</div>;
  }
  const { data } = supabase.storage.from("movie-posters").getPublicUrl(movie.poster_path);
  return <img src={data.publicUrl} alt={`${movie.title} 실습용 포스터`} width="400" height="600"
    className="mx-auto aspect-[2/3] w-36 sm:w-full rounded-lg object-cover" />;
}
