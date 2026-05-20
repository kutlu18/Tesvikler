import { CheckCircle2, Lock } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  message: string | null;
  onRegister: () => void;
  onLogin: () => void;
  onClose: () => void;
}

const benefits = [
  "Tüm analiz modülleri",
  "Analiz kaydetme",
  "Analizlerim arşivi",
  "Profil ve hareket geçmişi",
];

export default function UpgradeModal({ isOpen, message, onRegister, onLogin, onClose }: UpgradeModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
        <div className="bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_55%,_#f0f9ff_100%)] px-6 py-6">
          <div className="inline-flex rounded-2xl bg-white p-3 text-blue-700 shadow-sm">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Tüm destek modüllerine erişin</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message ??
              "Kayıt olarak tüm analiz modüllerini kullanabilir, analizlerinizi kaydedebilir ve müşteri bazlı geçmişinizi görüntüleyebilirsiniz."}
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onRegister} className="btn-primary !py-3">
              Kayıt Ol
            </button>
            <button type="button" onClick={onLogin} className="btn-secondary !py-3">
              Giriş Yap
            </button>
            <button type="button" onClick={onClose} className="btn-ghost !py-3 !text-slate-600">
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
