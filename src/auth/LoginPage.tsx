import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useAuth();
  const locationState = location.state as { from?: string; message?: string } | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("E-posta bos olamaz.");
      return;
    }

    if (!password.trim()) {
      setError("Sifre bos olamaz.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(locationState?.from ?? "/app", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "E-posta veya sifre hatali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 shadow-sm">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Guvenli erisim</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Destek analizlerinize kaldiginiz yerden devam edin</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Kayitli hesapla giris yaptiginizda tum modullere, analiz arsivinize ve profil ekraniniza erisirsiniz.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Giris Yap</h2>
        <p className="mt-2 text-sm text-slate-600">Kayitli hesabinizla platforma giris yapin.</p>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
        {locationState?.message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{locationState.message}</div> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-slate-800">E-posta</span>
            <input className="w-full rounded-2xl border border-slate-300 px-3 py-3" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-slate-800">Sifre</span>
            <input type="password" className="w-full rounded-2xl border border-slate-300 px-3 py-3" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting ? "Giris yapiliyor..." : "Giris Yap"}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-sm">
          <Link to="/auth/register" className="block font-medium text-blue-700 hover:text-blue-800">
            Hesabiniz yok mu? Kayit olun
          </Link>
          <Link to="/auth/forgot-password" className="block text-slate-500 hover:text-slate-700">
            Sifremi unuttum
          </Link>
          <button type="button" onClick={() => void continueAsGuest()} className="block text-slate-500 hover:text-slate-700">
            Misafir olarak devam et
          </button>
        </div>
      </section>
    </div>
  );
}
