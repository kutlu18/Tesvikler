import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f8fafc_55%,_#eef2ff_100%)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto grid max-w-[1560px] gap-6 lg:grid-cols-[300px_1fr]">
        <Sidebar />
        <div className="app-screen space-y-6">
          <Topbar />
          <div className="pb-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
