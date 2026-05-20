import { ArrowRight, LogIn, Sparkles, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Topbar() {
  const navigate = useNavigate();
  const { isGuest, isAuthenticated, profile, logout } = useAuth();

  return (
    <header className="app-shell-card rounded-[28px] border border-slate-200/80 bg-white/95 px-6 py-5 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Analiz Platformu
          </div>
          <h1 className="mt-3 text-[30px] font-bold tracking-tight text-slate-900 sm:text-[34px]">Teşvik Analiz Platformu</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[15px]">
            Müşteriniz için uygun destekleri seçin ve ön uygunluk analizini başlatın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isGuest ? (
            <>
              <span className="badge-warning inline-flex items-center gap-2">
                <UserRound className="h-3.5 w-3.5" />
                Misafir Mod
              </span>
              <button type="button" onClick={() => navigate("/auth/register")} className="btn-primary">
                Kayıt Ol
              </button>
              <button type="button" onClick={() => navigate("/auth/login")} className="btn-secondary">
                Giriş Yap
              </button>
            </>
          ) : isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
                {(profile?.fullName?.[0] ?? "K").toUpperCase()}
              </div>
              <div className="pr-2">
                <div className="text-sm font-semibold text-slate-900">{profile?.fullName || "Kullanıcı"}</div>
                <div className="text-xs text-slate-500">{profile?.companyName || profile?.email}</div>
              </div>
              <button type="button" onClick={() => navigate("/app/profile")} className="btn-secondary !px-3 !py-2">
                Profilim
              </button>
              <button type="button" onClick={() => navigate("/app/analyses")} className="btn-secondary !px-3 !py-2">
                Analizlerim
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => navigate("/auth/login")} className="btn-secondary inline-flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </button>
              <button type="button" onClick={() => navigate("/auth/register")} className="btn-primary inline-flex items-center gap-2">
                Kayıt Ol
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
