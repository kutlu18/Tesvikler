import type { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

interface GuestAllowedRouteProps {
  children?: ReactNode;
}

export default function GuestAllowedRoute({ children }: GuestAllowedRouteProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
