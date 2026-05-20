import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const previewModules = [
  { title: "SGK Teşvikleri", open: true },
  { title: "KOSGEB", open: false },
  { title: "TÜBİTAK", open: false },
  { title: "Yatırım Teşvik", open: false },
  { title: "Ticaret Bakanlığı", open: false },
  { title: "Tarım Destekleri", open: false },
];

export default function AuthLandingPage() {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuth();

  return (
    <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
            Devlet Destekleri ve Teşvik Analiz Platformu
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            SGK, KOSGEB, TÜBİTAK, Yatırım Teşvik, Ticaret Bakanlığı ve tarım destekleri için hızlı ön uygunluk analizi yapın.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Firmanızın faaliyet alanı, yatırım planı, personel yapısı ve ihracat durumuna göre yararlanabileceğiniz destekleri tek
            ekranda analiz edin.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ValueCard title="Hızlı Uygunluk Analizi" text="Müşteri bilgilerine göre uygun, potansiyel ve riskli destekleri ayrıştırın." />
            <ValueCard title="Analiz Geçmişi" text="Kayıtlı kullanıcılar önceki analizlerini saklayabilir ve yeniden açabilir." />
            <ValueCard title="Modül Bazlı Değerlendirme" text="SGK’dan TÜBİTAK’a farklı destek ailelerini ayrı ayrı inceleyin." />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {previewModules.map((module) => (
            <div key={module.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">{module.title}</div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${module.open ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {module.open ? "Açık" : "Kilitli"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Platforma Başlayın</h2>
        <p className="mt-2 text-sm text-slate-600">Hesap oluşturarak tüm destek modüllerine ve analiz geçmişine erişin.</p>
        <div className="mt-6 space-y-3">
          <button type="button" onClick={() => navigate("/auth/login")} className="btn-primary w-full !py-3">
            Giriş Yap
          </button>
          <button type="button" onClick={() => navigate("/auth/register")} className="btn-secondary w-full !py-3 !text-blue-700 !border-blue-200 !hover:bg-blue-50">
            Kayıt Ol
          </button>
          <button type="button" onClick={() => void continueAsGuest()} className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            Misafir Olarak Devam Et
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">Misafir kullanımda yalnızca SGK Teşvikleri modülü açıktır.</p>
      </section>
    </div>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
