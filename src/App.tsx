import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AuthenticatedOnlyRoute from "./auth/AuthenticatedOnlyRoute";
import AuthLandingPage from "./auth/AuthLandingPage";
import GuestAllowedRoute from "./auth/GuestAllowedRoute";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import UpdatePasswordPage from "./auth/UpdatePasswordPage";
import { moduleConfigs } from "./config/modules";
import AppLayout from "./layout/AppLayout";
import PublicLayout from "./layout/PublicLayout";
import ProductHomePage from "./pages/ProductHomePage";
import ProfilePage from "./profile/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />

      <Route path="/auth" element={<PublicLayout><AuthLandingPage /></PublicLayout>} />
      <Route path="/auth/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/auth/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
      <Route path="/auth/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
      <Route path="/auth/update-password" element={<PublicLayout><UpdatePasswordPage /></PublicLayout>} />

      <Route
        path="/app"
        element={
          <GuestAllowedRoute>
            <AppLayout />
          </GuestAllowedRoute>
        }
      >
        <Route index element={<ProductHomePage />} />
        {moduleConfigs.map((moduleItem) => {
          const Page = moduleItem.component;

          return (
            <Route
              key={moduleItem.id}
              path={moduleItem.path.replace("/app/", "")}
              element={
                moduleItem.guestAccess ? (
                  <GuestAllowedRoute>
                    <Page />
                  </GuestAllowedRoute>
                ) : (
                  <AuthenticatedOnlyRoute>
                    <Page />
                  </AuthenticatedOnlyRoute>
                )
              }
            />
          );
        })}
        <Route
          path="profile"
          element={
            <AuthenticatedOnlyRoute>
              <ProfileRoutePage initialTab="Genel Bilgiler" />
            </AuthenticatedOnlyRoute>
          }
        />
        <Route
          path="analyses"
          element={
            <AuthenticatedOnlyRoute>
              <ProfileRoutePage initialTab="Analizlerim" />
            </AuthenticatedOnlyRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

function ProfileRoutePage({ initialTab }: { initialTab: "Genel Bilgiler" | "Analizlerim" }) {
  const navigate = useNavigate();

  return (
    <ProfilePage
      onNavigateToModule={(moduleKey) => {
        const pathMap: Record<string, string> = {
          sgk: "/app/sgk",
          kosgeb: "/app/kosgeb",
          tubitak: "/app/tubitak",
          ticaret: "/app/ticaret",
          eximbank: "/app/eximbank",
          yatirim_tesvik: "/app/yatirim-tesvik",
          kalkinma_ajansi: "/app/kalkinma-ajansi",
          vergisel_tesvik: "/app/vergisel-tesvik",
        };

        navigate(pathMap[moduleKey] ?? "/app");
      }}
      initialTab={initialTab}
    />
  );
}
