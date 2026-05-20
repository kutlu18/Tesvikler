import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

interface AuthenticatedOnlyRouteProps {
  children?: ReactNode;
}

export default function AuthenticatedOnlyRoute({ children }: AuthenticatedOnlyRouteProps) {
  const { isAuthenticated, isGuest, isLoading, openUpgradeModal } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-8 text-sm text-slate-600">Yukleniyor...</div>;
  }

  if (isAuthenticated) {
    return children ? <>{children}</> : <Outlet />;
  }

  if (isGuest) {
    openUpgradeModal("Bu modüle erismek icin kayit olmaniz veya giris yapmaniz gerekiyor.");
    return <Navigate to="/app" replace state={{ from: location.pathname }} />;
  }

  return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
}
