import { FormEvent, useEffect, useState } from "react";
import type { UserRole } from "../../types/auth";
import { useAuth } from "../../auth/useAuth";

const roleOptions: UserRole[] = ["Mali Musavir", "Bagimsiz Denetci", "Tesvik Danismani", "Sirket Yetkilisi", "Diger"];

export default function ProfileSettingsTab() {
  const { profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [role, setRole] = useState<UserRole>(profile?.role ?? "Diger");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFullName(profile?.fullName ?? "");
    setCompanyName(profile?.companyName ?? "");
    setRole(profile?.role ?? "Diger");
  }, [profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      await updateProfile({ fullName, companyName, role });
      setMessage("Profil bilgileri güncellendi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profil güncellenemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="app-section p-5" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-slate-900">Ayarlar</h2>
      <p className="mt-1 text-sm text-slate-600">Profil kartında gösterilen temel bilgileri buradan güncelleyebilirsiniz.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="app-label">Ad Soyad</span>
          <input className="app-input" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </label>

        <label className="block text-sm">
          <span className="app-label">Firma adı</span>
          <input className="app-input" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
        </label>

        <label className="block text-sm">
          <span className="app-label">Rol</span>
          <select className="app-input" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-5">
        {isSubmitting ? "Kaydediliyor..." : "Profili Güncelle"}
      </button>
    </form>
  );
}
