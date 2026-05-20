import {
  ArrowRight,
  Database,
  LayoutDashboard,
  Lock,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import HowItWorks from "../components/HowItWorks";
import MetricCard from "../components/MetricCard";
import { moduleConfigs } from "../config/modules";
import ModuleCard from "../layout/ModuleCard";

export default function ProductHomePage() {
  const navigate = useNavigate();
  const { isGuest, isAuthenticated, openUpgradeModal, profile } = useAuth();

  const guestLockedCount = moduleConfigs.filter((item) => !item.guestAccess).length;
  const visibleModules = moduleConfigs;

  const guestMetricCards = useMemo(
    () => [
      {
        title: "Misafir Mod",
        value: "Etkin",
        description: "Misafir kullanımı aktif durumda.",
        icon: UserRound,
        tone: "amber" as const,
      },
      {
        title: "Açık Modül",
        value: "SGK",
        description: "Şu anda SGK Teşvikleri modülü erişime açık.",
        icon: ShieldCheck,
        tone: "emerald" as const,
      },
      {
        title: "Kilitli Modüller",
        value: String(guestLockedCount),
        description: "Kayıtla açılacak premium analiz modülleri.",
        icon: LockKeyhole,
        tone: "slate" as const,
      },
      {
        title: "Analiz Kaydı",
        value: "Hesap gerekir",
        description: "Analizleri saklamak için ücretsiz hesap oluşturun.",
        icon: Database,
        tone: "blue" as const,
      },
    ],
    [guestLockedCount],
  );

  const authMetricCards = useMemo(
    () => [
      {
        title: "Toplam Analiz",
        value: "Arşivden takip edin",
        description: "Kaydedilen analizler Profilim içinde listelenir.",
        icon: LayoutDashboard,
        tone: "blue" as const,
      },
      {
        title: "Bu Ay Analiz",
        value: "Canlı profil özeti",
        description: "Kullanım yoğunluğunu Profilim ekranından takip edin.",
        icon: ShieldCheck,
        tone: "emerald" as const,
      },
      {
        title: "En Aktif Modül",
        value: "Özet kartında",
        description: "Hangi modülün daha sık kullanıldığını görün.",
        icon: ArrowRight,
        tone: "slate" as const,
      },
      {
        title: "Kayıtlı Taslaklar",
        value: "Analizlerim",
        description: "Taslak ve tamamlanan kayıtları yönetin.",
        icon: Database,
        tone: "amber" as const,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {isGuest ? (
        <GuestHero
          onRegister={() => navigate("/auth/register")}
          onLogin={() => navigate("/auth/login")}
          onOpenSgk={() => navigate("/app/sgk")}
        />
      ) : (
        <AuthenticatedHero
          title={profile?.fullName ? `Hoş geldiniz, ${profile.fullName}` : "Platforma hoş geldiniz"}
          description="Müşteriniz için uygun destekleri seçin, ön uygunluk analizlerini başlatın ve kayıtlı analizlerinizi tek merkezden yönetin."
          onOpenAnalyses={() => navigate("/app/analyses")}
          onOpenProfile={() => navigate("/app/profile")}
        />
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {(isAuthenticated ? authMetricCards : guestMetricCards).map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="app-section">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[26px] font-bold tracking-tight text-slate-900">Analiz modülleri</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              SGK’dan TÜBİTAK’a kadar tüm destek ailelerini ayrı modüller halinde değerlendirin.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleModules.map((moduleItem) => (
            <ModuleCard
              key={moduleItem.id}
              moduleItem={moduleItem}
              locked={isGuest && !moduleItem.guestAccess}
              onLockedClick={() =>
                openUpgradeModal(
                  "Kayıt olarak KOSGEB, TÜBİTAK, Yatırım Teşvik, Ticaret Bakanlığı, Eximbank ve diğer analiz modüllerini kullanabilirsiniz.",
                )
              }
            />
          ))}
        </div>
      </section>

      <HowItWorks isGuest={isGuest} />

      <section className="app-section">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Analiz geçmişi</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {isGuest
                ? "Misafir modda analiz geçmişi tutulmaz. Analizlerinizi kaydetmek için hesap oluşturun."
                : "Kaydedilmiş analizlerinizi, notlarınızı ve son güncellenen kayıtları Analizlerim ekranında görüntüleyin."}
            </p>
          </div>
          {isGuest ? (
            <button type="button" onClick={() => navigate("/auth/register")} className="btn-primary">
              Kayıt Ol
            </button>
          ) : (
            <button type="button" onClick={() => navigate("/app/analyses")} className="btn-secondary">
              Analizlerime Git
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function GuestHero({
  onRegister,
  onLogin,
  onOpenSgk,
}: {
  onRegister: () => void;
  onLogin: () => void;
  onOpenSgk: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_45%,_#ecfeff_100%)] p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <span className="badge-warning inline-flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" />
            Misafir Mod
          </span>
          <h2 className="mt-5 text-[32px] font-bold tracking-tight text-slate-900 sm:text-[40px]">
            Misafir Modda SGK Analizine Başlayın
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
            Misafir olarak SGK teşvikleri modülünü deneyebilirsiniz. Tüm destek modüllerine, analiz kaydetme özelliğine
            ve geçmiş analizlere erişmek için hesap oluşturun.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={onRegister} className="btn-primary !px-5 !py-3">
              Hesap Oluştur ve Tümünü Aç
            </button>
            <button type="button" onClick={onLogin} className="btn-secondary !px-5 !py-3">
              Giriş Yap
            </button>
            <button type="button" onClick={onOpenSgk} className="btn-ghost !px-2 !py-3">
              SGK Analizine Başla
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <HeroMiniCard icon={ShieldCheck} title="Açık Modül" text="SGK teşviklerini hemen deneyin." tone="emerald" />
          <HeroMiniCard
            icon={Lock}
            title="Premium Erişim"
            text="KOSGEB, TÜBİTAK, Eximbank ve diğer modüller hesapla açılır."
            tone="amber"
          />
          <HeroMiniCard icon={Database} title="Analiz Geçmişi" text="Hesap açarak analizlerinizi kaydedin." tone="blue" />
        </div>
      </div>
    </section>
  );
}

function AuthenticatedHero({
  title,
  description,
  onOpenAnalyses,
  onOpenProfile,
}: {
  title: string;
  description: string;
  onOpenAnalyses: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#eff6ff_55%,_#f8fafc_100%)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            Tüm modüller açık
          </span>
          <h2 className="mt-5 text-[30px] font-bold tracking-tight text-slate-900 sm:text-[38px]">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-[15px]">{description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onOpenAnalyses} className="btn-primary !px-5 !py-3">
            Analizlerim
          </button>
          <button type="button" onClick={onOpenProfile} className="btn-secondary !px-5 !py-3">
            Profilim
          </button>
        </div>
      </div>
    </section>
  );
}

function HeroMiniCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  tone: "blue" | "emerald" | "amber";
}) {
  const toneClasses =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700 ring-amber-100"
        : "bg-blue-50 text-blue-700 ring-blue-100";

  return (
    <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur">
      <div className={`inline-flex rounded-2xl p-3 ring-1 ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-base font-bold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
