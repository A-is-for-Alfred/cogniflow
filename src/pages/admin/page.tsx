import { useState, useCallback, useEffect } from "react";
import AdminLogin from "./components/AdminLogin";
import EmployeeList from "./components/EmployeeList";
import SessionList from "./components/SessionList";
import ConversationView from "./components/ConversationView";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  language: string;
}

interface Session {
  id: number;
  employee_id: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("cogniflow_admin_auth") === "true"
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [supabaseCleared, setSupabaseCleared] = useState(false);

  // Clear any existing Supabase auth session so RLS doesn't filter results.
  // The admin panel uses only anon access — no Supabase Auth needed.
  useEffect(() => {
    if (!authenticated) return;
    supabase.auth.signOut().then(() => {
      setSupabaseCleared(true);
    });
  }, [authenticated]);

  const handleLogin = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("cogniflow_admin_auth");
    setAuthenticated(false);
    setSelectedEmployee(null);
    setSelectedSession(null);
    setSupabaseCleared(false);
  }, []);

  const handleSelectEmployee = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedSession(null);
  }, []);

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (!supabaseCleared) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-foreground-600">Preparando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-50">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-background-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-foreground-950 whitespace-nowrap">
            Cogniflow Admin
          </h1>
          <span className="text-xs text-foreground-500 bg-background-100 px-2 py-0.5 rounded-full">
            Testing
          </span>
        </div>
        <div className="flex items-center gap-4">
          {selectedEmployee && (
            <span className="text-xs text-foreground-600 whitespace-nowrap">
              Empleado: <strong className="text-foreground-950">{selectedEmployee.name}</strong>
            </span>
          )}
          {selectedSession && (
            <span className="text-xs text-foreground-600 whitespace-nowrap">
              Sesión: <strong className="text-foreground-950">#{selectedSession.id}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="whitespace-nowrap text-xs text-foreground-600 hover:text-accent-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <i className="ri-logout-box-r-line"></i>
            Salir
          </button>
        </div>
      </header>

      {/* Main content: three-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Employees */}
        <div className="w-72 shrink-0 border-r border-background-200 bg-white overflow-hidden">
          <EmployeeList
            selectedId={selectedEmployee?.id ?? null}
            onSelect={handleSelectEmployee}
          />
        </div>

        {/* Column 2: Sessions */}
        <div className="w-72 shrink-0 border-r border-background-200 bg-white overflow-hidden">
          <SessionList
            employeeId={selectedEmployee?.id ?? null}
            selectedSessionId={selectedSession?.id ?? null}
            onSelect={setSelectedSession}
          />
        </div>

        {/* Column 3: Conversation */}
        <div className="flex-1 bg-white overflow-hidden">
          <ConversationView
            sessionId={selectedSession?.id ?? null}
            employeeName={selectedEmployee?.name ?? ""}
          />
        </div>
      </div>
    </div>
  );
}