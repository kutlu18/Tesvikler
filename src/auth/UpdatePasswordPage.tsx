import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Sifre en az 6 karakter olmali.");
      return;
    }

    if (password !== passwordRepeat) {
      setError("Sifre tekrar alani ile sifre ayni olmali.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setSuccess("Sifreniz guncellendi. Yonlendiriliyorsunuz...");
      window.setTimeout(() => navigate("/app", { replace: true }), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Sifre guncellenemedi. Baglanti suresi dolmus olabilir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Yeni Sifre Belirle</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          E-postadaki baglanti ile geldiyseniz yeni sifrenizi belirleyebilirsiniz.
        </p>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
        {success ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{success}</div> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-slate-800">Yeni sifre</span>
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 px-3 py-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-slate-800">Yeni sifre tekrar</span>
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-300 px-3 py-3"
              value={passwordRepeat}
              onChange={(event) => setPasswordRepeat(event.target.value)}
              autoComplete="new-password"
            />
          </label>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting ? "Guncelleniyor..." : "Sifremi Guncelle"}
          </button>
        </form>

        <Link to="/auth/login" className="mt-5 block text-sm font-medium text-blue-700 hover:text-blue-800">
          Giris ekranina don
        </Link>
      </section>
    </div>
  );
}
