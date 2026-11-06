import { House, Settings } from "lucide-react";
import { Link, Navigate, Route, Routes } from "react-router";
import MoviesPage from "./pages/MoviesPage.jsx";
import MovieDetailPage from "./pages/MovieDetailPage.jsx";

import AuthButton from "./components/AuthButton.jsx";
import { useAuth } from "./hooks/useAuth.js";

function App() {
  const auth = useAuth();
  let adminPage;
  if (auth.session === undefined) {
    adminPage = null;
  } else if (!auth.session) {
    adminPage = <Navigate to="/" replace />;
  } else if (auth.isAdmin === undefined) {
    adminPage = null;
  } else if (!auth.isAdmin) {
    adminPage = <Navigate to="/" replace />;
  } else {
    adminPage = <MoviesPage key={`admin-${auth.session.user.id}`} isAdmin={true} />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 pt-8 pb-20">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Movie App</h1>
        <div className="flex max-w-full flex-wrap items-center justify-end gap-3">
        <nav className="flex shrink-0 gap-2" aria-label="주 메뉴">
          <Link to="/" aria-label="영화 목록" title="영화 목록" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2"><House className="size-5" strokeWidth={1.7} aria-hidden="true" /></Link>
          {auth.isAdmin && (
          <Link to="/admin" aria-label="영화 관리" title="영화 관리" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2"><Settings className="size-5" strokeWidth={1.7} aria-hidden="true" /></Link>
          )}
        </nav>
        <AuthButton auth={auth} />
        </div>
      </header>
      <Routes>
        <Route path="/" element={<MoviesPage key="public" />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/admin" element={adminPage} />
        <Route path="*" element={<Link to="/">영화 목록으로 돌아가기</Link>} />
      </Routes>
    </main>
  );
}

export default App;
