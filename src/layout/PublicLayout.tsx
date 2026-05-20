import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-600">Yukleniyor...</div>;
  }

  if (location.pathname === "/auth/update-password") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    );
  }

  if (isAuthenticated || isGuest) {
    return <Navigate to={(location.state as { from?: string } | null)?.from ?? "/app"} replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
