import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { UserRole } from "../types/auth";
import { useAuth } from "./useAuth";

const roleOptions: UserRole[] = ["Mali Musavir", "Bagimsiz Denetci", "Tesvik Danismani", "Sirket Yetkilisi", "Diger"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, continueAsGuest } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<UserRole>("Mali Musavir");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== passwordRepeat) {
      setError("Sifre tekrar alani ile sifre ayni olmali.");
      return;
    }

    if (!acceptedTerms) {
      setError("Kullanim kosullarini ve KVKK metnini onaylamaniz gerekiyor.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ fullName, email, password, companyName, role });
      navigate("/app", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Kayit olusturulamadi. Lutfen bilgileri kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
      <h1 className="text-3xl font-bold text-slate-900">Hesap Olustur</h1>
      <p className="mt-2 text-sm text-slate-600">Hesap olusturarak tum destek modullerine ve analiz gecmisine erisebilirsiniz.</p>

      {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-2 block font-medium text-slate-800">Ad Soyad</span>
          <input className="w-full rounded-2xl border border-slate-300 px-3 py-3" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-2 block font-medium text-slate-800">E-posta</span>
          <input type="email" className="w-full rounded-2xl border border-slate-300 px-3 py-3" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-medium text-slate-800">Sifre</span>
          <input type="password" className="w-full rounded-2xl border border-slate-300 px-3 py-3" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-medium text-slate-800">Sifre Tekrar</span>
          <input type="password" className="w-full rounded-2xl border border-slate-300 px-3 py-3" value={passwordRepeat} onChange={(event) => setPasswordRepeat(event.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-medium text-slate-800">Firma Adi</span>
          <input className="w-full rounded-2xl border border-slate-300 px-3 py-3" value={companyName} onChange={(event) => setCompanyName(event.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-medium text-slate-800">Rol</span>
          <select className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:col-span-2">
          <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1" />
          <span>Kullanim kosullarini ve KVKK aydinlatma metnini okudum.</span>
        </label>

        <div className="space-y-3 sm:col-span-2">
          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
            {isSubmitting ? "Kayit olusturuluyor..." : "Kayit Ol"}
          </button>
          <Link to="/auth/login" className="block text-sm font-medium text-blue-700 hover:text-blue-800">
            Zaten hesabinız var mı? Giris yapin
          </Link>
          <button type="button" onClick={() => void continueAsGuest()} className="block text-sm text-slate-500 hover:text-slate-700">
            Misafir olarak devam et
          </button>
        </div>
      </form>
    </div>
  );
}
