import {
  Atom,
  BriefcaseBusiness,
  ChevronRight,
  Coins,
  FileChartColumnIncreasing,
  FlaskConical,
  Globe2,
  Landmark,
  LayoutDashboard,
  Lock,
  MapPinned,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { moduleConfigs } from "../config/modules";

const iconMap = {
  sgk: ShieldCheck,
  kosgeb: BriefcaseBusiness,
  tubitak: FlaskConical,
  "yatirim-tesvik": FileChartColumnIncreasing,
  ticaret: Globe2,
  eximbank: Landmark,
  "kalkinma-ajansi": MapPinned,
  "vergisel-tesvik": ReceiptText,
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isGuest, isAuthenticated, openUpgradeModal } = useAuth();

  return (
    <aside className="app-shell-card app-shell-card-hover rounded-[28px] border border-slate-200/80 bg-white/95 p-5 backdrop-blur">
      <div className="rounded-3xl bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_50%,_#1e3a8a_100%)] px-4 py-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-2xl bg-white/10 p-3 text-blue-200">
            <Atom className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">Teşvik Analiz</div>
            <div className="text-xs text-slate-300">Destek Uygunluk Platformu</div>
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        <NavItem to="/app" label="Dashboard" active={location.pathname === "/app"} icon={LayoutDashboard} />

        {moduleConfigs.map((moduleItem) => {
          const Icon = iconMap[moduleItem.id as keyof typeof iconMap] ?? Coins;
          const locked = isGuest && !moduleItem.guestAccess;
          const isActive = location.pathname === moduleItem.path;

          if (locked) {
            return (
              <button
                key={moduleItem.id}
                type="button"
                onClick={() => openUpgradeModal("Bu modül kayıtlı kullanıcılara açıktır.")}
                className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-white">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-slate-700">{moduleItem.title}</div>
                    <div className="text-xs text-slate-500">Kayıtlı kullanıcı</div>
                  </div>
                </div>
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </button>
            );
          }

          return <NavItem key={moduleItem.id} to={moduleItem.path} label={moduleItem.title} active={isActive} icon={Icon} />;
        })}
      </nav>

      {isAuthenticated ? (
        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="space-y-2">
            <NavItem
              to="/app/analyses"
              label="Analizlerim"
              active={location.pathname === "/app/analyses"}
              icon={FileChartColumnIncreasing}
            />
            <NavItem to="/app/profile" label="Profilim" active={location.pathname === "/app/profile"} icon={UserRound} />
          </div>
        </div>
      ) : null}

      {isGuest ? (
        <div className="mt-6 rounded-3xl border border-blue-200 bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_55%,_#eef2ff_100%)] p-4 shadow-sm">
          <div className="inline-flex rounded-2xl bg-white/85 p-2 text-blue-700 shadow-sm">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Tüm modülleri aç</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Kayıt olarak KOSGEB, TÜBİTAK, Yatırım Teşvik ve diğer analiz modüllerini kullanın.
          </p>
          <button
            type="button"
            onClick={() => navigate("/auth/register")}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            Kayıt Ol
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function NavItem({
  to,
  label,
  active,
  icon: Icon,
}: {
  to: string;
  label: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
        active ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span
        className={`inline-flex rounded-xl p-2 ${
          active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span>{label}</span>
    </Link>
  );
}
