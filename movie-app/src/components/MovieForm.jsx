function MovieForm({
  form,
  setForm,
  error,
  isSubmitting,
  handleSubmit,
  handleCancel,
  submitLabel,
}) {
  return (
    <form aria-label="영화 정보" onSubmit={handleSubmit} className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
      <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>
      <fieldset className="flex min-w-0 flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          제목
          <input type="text" value={form.title} onChange={(event) => {
              const title = event.target.value;
              setForm((prev) => ({ ...prev, title }));
            }} required maxLength={50}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-2 focus:outline-blue-600" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          감독
          <input type="text" value={form.director} onChange={(event) => {
              const director = event.target.value;
              setForm((prev) => ({ ...prev, director }));
            }} required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-2 focus:outline-blue-600" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          개봉 연도
          <input type="number" value={form.releaseYear} onChange={(event) => {
              const releaseYear = event.target.value;
              setForm((prev) => ({ ...prev, releaseYear }));
            }} required min={1} max={2147483647} step={1}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-2 focus:outline-blue-600" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          줄거리
          <textarea value={form.overview} onChange={(event) => {
              const overview = event.target.value;
              setForm((prev) => ({ ...prev, overview }));
            }} required rows={3}
            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-2 focus:outline-blue-600" />
        </label>
        <div className="flex justify-end gap-2">
          {handleCancel && (
            <button type="button" onClick={handleCancel} className="cursor-pointer rounded-lg border border-slate-300 px-5 py-3 text-sm hover:bg-slate-50">취소</button>
          )}
          <button type="submit" disabled={isSubmitting} className="cursor-pointer rounded-lg bg-slate-900 px-5 py-3 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "처리 중..." : submitLabel}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default MovieForm;
