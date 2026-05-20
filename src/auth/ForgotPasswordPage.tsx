import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("E-posta bos olamaz.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSuccess("Sifre sifirlama baglantisi e-posta adresinize gonderildi. Gelen kutusu ve spam klasorunu kontrol edin.");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Sifre sifirlama maili gonderilemedi.";
      setError(message.includes("you can only request this after") ? "Cok kisa sure icinde fazla mail istendi. Lutfen biraz bekleyip tekrar deneyin." : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Sifremi Unuttum</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kayitli e-posta adresinizi yazin; yeni sifre belirleme baglantisini size gonderelim.
        </p>

        {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
        {success ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{success}</div> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-slate-800">E-posta</span>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-300 px-3 py-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting ? "Gonderiliyor..." : "Sifre Sifirlama Maili Gonder"}
          </button>
        </form>

        <Link to="/auth/login" className="mt-5 block text-sm font-medium text-blue-700 hover:text-blue-800">
          Giris ekranina don
        </Link>
      </section>
    </div>
  );
}
