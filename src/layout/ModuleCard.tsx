import {
  BriefcaseBusiness,
  Factory,
  FlaskConical,
  Globe2,
  Landmark,
  Lock,
  MapPinned,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ModuleConfig } from "../config/modules";

interface ModuleCardProps {
  moduleItem: ModuleConfig;
  locked: boolean;
  onLockedClick: () => void;
}

const iconMap = {
  sgk: ShieldCheck,
  kosgeb: BriefcaseBusiness,
  tubitak: FlaskConical,
  yatirim: Factory,
  ticaret: Globe2,
  eximbank: Landmark,
  kalkinma: MapPinned,
  vergi: ReceiptText,
};

export default function ModuleCard({ moduleItem, locked, onLockedClick }: ModuleCardProps) {
  const navigate = useNavigate();
  const Icon = iconMap[moduleItem.iconKey as keyof typeof iconMap] ?? BriefcaseBusiness;

  return (
    <article
      className={`group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-card ${
        locked ? "cursor-pointer" : ""
      }`}
      onClick={() => {
        if (locked) {
          onLockedClick();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.08),_transparent_34%)]" />
      {locked ? <div className="absolute inset-0 bg-slate-100/70" /> : null}

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`inline-flex rounded-2xl p-3 ring-1 ${
              locked ? "bg-slate-100 text-slate-500 ring-slate-200" : "bg-blue-50 text-blue-700 ring-blue-100"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                locked
                  ? "bg-slate-100 text-slate-600"
                  : moduleItem.guestAccess
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {locked ? "Kilitli" : moduleItem.guestAccess ? "Açık" : "Kayıtlı kullanıcı"}
            </span>
            {locked ? <Lock className="h-4.5 w-4.5 text-slate-400" /> : null}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-[21px] font-bold tracking-tight text-slate-900">{moduleItem.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{moduleItem.description}</p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {moduleItem.guestAccess && !locked ? (
            <span className="badge-success">Misafir erişimine açık</span>
          ) : (
            <span className="text-xs text-slate-500">Bu modül kayıtlı kullanıcılar için açıktır.</span>
          )}
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (locked) {
                onLockedClick();
                return;
              }

              navigate(moduleItem.path);
            }}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              locked
                ? "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                : "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md"
            }`}
          >
            {locked ? "Kayıt Ol ve Aç" : "Analize Başla"}
          </button>
        </div>
      </div>
    </article>
  );
}
