import googleSignIn from "../assets/google-sign-in.png";

export default function AuthButton({ auth }) {
  const { session, loginWithGoogle, logout } = auth;

  if (session) {
    return (
      <button type="button" onClick={logout}
        className="h-10 cursor-pointer rounded border border-slate-300 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2">
        로그아웃
      </button>
    );
  }

  return (
    <button type="button" onClick={loginWithGoogle} aria-label="Google 계정으로 로그인"
      className="h-10 w-[180px] shrink-0 cursor-pointer rounded bg-white p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
      <img src={googleSignIn} alt="Sign in with Google" width="180" height="40" />
    </button>
  );
}
