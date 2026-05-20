import { FilePenLine, Lock, SearchCheck, WandSparkles } from "lucide-react";

interface HowItWorksProps {
  isGuest: boolean;
}

const steps = [
  {
    title: "Bilgileri Girin",
    description: "Firma, faaliyet, çalışan ve yatırım bilgilerini adım adım doldurun.",
    icon: FilePenLine,
  },
  {
    title: "Uygunluğu Görün",
    description: "Uygun, potansiyel ve riskli destekleri tek ekranda karşılaştırın.",
    icon: SearchCheck,
  },
  {
    title: "Analizi Kaydedin",
    description: "Hesap oluşturarak analizlerinizi arşivleyin ve tekrar açın.",
    icon: WandSparkles,
  },
];

export default function HowItWorks({ isGuest }: HowItWorksProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nasıl çalışır?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Analiz akışını üç adımda tamamlayın ve müşteri için en uygun destekleri net biçimde görün.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLocked = isGuest && index === 2;

          return (
            <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:bg-white">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                {isLocked ? (
                  <span className="badge-warning inline-flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    Hesap gerekir
                  </span>
                ) : null}
              </div>
              <div className="mt-5 text-lg font-bold text-slate-900">{step.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
