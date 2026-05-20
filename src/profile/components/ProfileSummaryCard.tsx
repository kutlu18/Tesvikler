import { analysisTypeLabels } from "../../types/analysis";
import type { UserProfile } from "../../types/auth";
import type { ProfileSummary } from "../../db/profileService";

interface ProfileSummaryCardProps {
  profile: UserProfile | null;
  summary: ProfileSummary | null;
}

export default function ProfileSummaryCard({ profile, summary }: ProfileSummaryCardProps) {
  if (!profile) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#eff6ff_65%,_#f8fafc_100%)] p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
            {profile.fullName.slice(0, 1).toUpperCase()}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">{profile.fullName}</h1>
          <p className="mt-1 text-sm text-slate-600">{profile.email}</p>
          <p className="mt-1 text-sm text-slate-600">{profile.companyName || "Firma bilgisi eklenmedi"}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[480px]">
          <MetricCard label="Rol" value={profile.role} />
          <MetricCard label="Kayıt tarihi" value={new Date(profile.createdAt).toLocaleDateString("tr-TR")} />
          <MetricCard label="Son giriş" value={profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString("tr-TR") : "Bilinmiyor"} />
          <MetricCard label="Toplam analiz" value={String(summary?.totalAnalysisCount ?? 0)} />
          <MetricCard
            label="En çok kullanılan modül"
            value={summary?.mostUsedAnalysisModule ? analysisTypeLabels[summary.mostUsedAnalysisModule] : "Henüz veri yok"}
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
