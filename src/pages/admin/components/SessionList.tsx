import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Session {
  id: number;
  employee_id: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

interface SessionListProps {
  employeeId: number | null;
  selectedSessionId: number | null;
  onSelect: (session: Session) => void;
}

export default function SessionList({
  employeeId,
  selectedSessionId,
  onSelect,
}: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) {
      setSessions([]);
      return;
    }

    const fetchSessions = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error: fetchError } = await supabase
          .from("sessions")
          .select("id, employee_id, started_at, ended_at, created_at")
          .eq("employee_id", employeeId)
          .order("started_at", { ascending: false });

        if (fetchError) throw fetchError;
        setSessions(data || []);
      } catch (err) {
        setError("Error al cargar sesiones");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [employeeId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (!employeeId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-foreground-500">
          Seleccioná un empleado para ver sus sesiones
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-background-200">
        <h2 className="text-sm font-semibold text-foreground-950">
          Sesiones ({sessions.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-foreground-600">Cargando...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-accent-900 bg-accent-100 m-3 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="text-sm text-foreground-500 text-center py-8">
            Sin sesiones
          </p>
        )}

        {!loading &&
          !error &&
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session)}
              className={`w-full text-left px-4 py-3 border-b border-background-100 transition-colors cursor-pointer hover:bg-background-50 ${
                selectedSessionId === session.id
                  ? "bg-secondary-100 border-l-2 border-l-secondary-500"
                  : "border-l-2 border-l-transparent"
              }`}
            >
              <div className="text-sm font-medium text-foreground-950 whitespace-nowrap">
                Sesión #{session.id}
              </div>
              <div className="text-xs text-foreground-600 mt-0.5">
                {formatDate(session.started_at)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-foreground-500 bg-background-100 px-1.5 py-0.5 rounded">
                  {getDuration(session.started_at, session.ended_at)}
                </span>
                {!session.ended_at && (
                  <span className="text-xs text-accent-900 bg-accent-100 px-1.5 py-0.5 rounded">
                    Activa
                  </span>
                )}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}