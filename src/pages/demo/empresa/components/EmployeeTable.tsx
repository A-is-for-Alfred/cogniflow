import type { Employee } from "../page";

interface EmployeeTableProps {
  employees: Employee[];
  onSelectEmployee: (e: Employee) => void;
}

function StatusBadge({ status }: { status: Employee["status"] }) {
  const map = {
    Excelente: { bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
    Activo: { bg: "#EDE9FE", color: "#7C3AED", dot: "#8B5CF6" },
    "En riesgo": { bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></span>
      {status}
    </span>
  );
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-gray-700">{value}%</span>
    </div>
  );
}

export default function EmployeeTable({ employees, onSelectEmployee }: EmployeeTableProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-black">Estado por colaborador</h2>
          <p className="text-sm text-gray-400">Haz clic en cualquier fila para ver el reporte completo</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-4">Colaborador</div>
          <div className="col-span-1 text-center">Estado</div>
          <div className="col-span-2">Felicidad</div>
          <div className="col-span-2">Productividad</div>
          <div className="col-span-2">Burnout</div>
          <div className="col-span-1 text-right">Última sesión</div>
        </div>

        {/* Rows */}
        {employees.map((emp) => (
          <button
            key={emp.id}
            onClick={() => onSelectEmployee(emp)}
            className="grid grid-cols-12 w-full px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer text-left items-center last:border-b-0"
          >
            {/* Name + Role */}
            <div className="col-span-4 flex items-center gap-3">
              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-black">{emp.name}</p>
                <p className="text-xs text-gray-400">{emp.role} · {emp.department}</p>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-1 flex justify-center">
              <StatusBadge status={emp.status} />
            </div>

            {/* Happiness */}
            <div className="col-span-2">
              <MiniBar value={emp.happiness} color="#7C3AED" />
            </div>

            {/* Productivity */}
            <div className="col-span-2">
              <MiniBar value={emp.productivity} color="#059669" />
            </div>

            {/* Burnout */}
            <div className="col-span-2">
              <MiniBar value={emp.burnout} color="#EF4444" />
            </div>

            {/* Last session */}
            <div className="col-span-1 flex justify-end">
              <span className="text-xs text-gray-400">{emp.lastSession}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}