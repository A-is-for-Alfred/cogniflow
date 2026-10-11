import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  language: string;
}

interface EmployeeListProps {
  selectedId: number | null;
  onSelect: (employee: Employee) => void;
}

export default function EmployeeList({ selectedId, onSelect }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("employees")
          .select("id, name, email, position, language")
          .order("name");

        if (fetchError) throw fetchError;
        setEmployees(data || []);
      } catch (err) {
        setError("Error al cargar empleados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-background-200">
        <h2 className="text-sm font-semibold text-foreground-950 mb-3">
          Empleados ({employees.length})
        </h2>
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empleado..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-background-200 rounded-md bg-background-50 text-foreground-950 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
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
            <button
              onClick={() => window.location.reload()}
              className="ml-2 underline cursor-pointer whitespace-nowrap"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-foreground-500 text-center py-8">
            {search ? "Sin resultados" : "No hay empleados"}
          </p>
        )}

        {!loading &&
          !error &&
          filtered.map((emp) => (
            <button
              key={emp.id}
              onClick={() => onSelect(emp)}
              className={`w-full text-left px-4 py-3 border-b border-background-100 transition-colors cursor-pointer hover:bg-background-50 ${
                selectedId === emp.id
                  ? "bg-primary-100 border-l-2 border-l-primary-500"
                  : "border-l-2 border-l-transparent"
              }`}
            >
              <div className="text-sm font-medium text-foreground-950 whitespace-nowrap">
                {emp.name}
              </div>
              <div className="text-xs text-foreground-600 mt-0.5 whitespace-nowrap">
                {emp.email}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {emp.position && (
                  <span className="text-xs text-foreground-500 bg-background-100 px-1.5 py-0.5 rounded">
                    {emp.position}
                  </span>
                )}
                <span className="text-xs text-foreground-400 uppercase">
                  {emp.language || "es"}
                </span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}