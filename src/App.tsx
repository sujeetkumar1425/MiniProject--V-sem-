import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import FraudDetection from "./pages/FraudDetection";
import NetworkAnomaly from "./pages/NetworkAnomaly";
import Reports from "./pages/Reports";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { AppProvider } from "./context/AppContext";

export type Page = "dashboard" | "fraud" | "network" | "reports" | "admin-login" | "admin";

function MainApp() {
  const [page, setPage] = useState<Page>("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    setIsAdmin(true);
    setPage("admin");
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setPage("dashboard");
  };

  const handleNav = (p: Page) => {
    if (p === "admin" && !isAdmin) {
      setPage("admin-login");
    } else {
      setPage(p);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Sidebar current={page} onNav={handleNav} isAdmin={isAdmin} />
      <main className="flex-1 overflow-hidden relative">
        {page === "dashboard" && <Dashboard onNavigate={handleNav} />}
        {page === "fraud" && <FraudDetection />}
        {page === "network" && <NetworkAnomaly />}
        {page === "reports" && <Reports />}
        {page === "admin-login" && <AdminLogin onLogin={handleLogin} />}
        {page === "admin" && isAdmin && <AdminDashboard onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
