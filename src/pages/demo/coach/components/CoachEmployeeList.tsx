import type { CoachEmployee } from "../page";

interface CoachEmployeeListProps {
  employees: CoachEmployee[];
  selectedId: number;
  onSelect: (e: CoachEmployee) => void;
}

export default function CoachEmployeeList({ employees, selectedId, onSelect }: CoachEmployeeListProps) {
  return (
    <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
      <div className="p-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colaboradores</p>
      </div>
      <ul className="py-2">
        {employees.map((emp) => {
          const isSelected = emp.id === selectedId;
          const statusColor = emp.status === "En riesgo" ? "#DC2626" : emp.status === "Excelente" ? "#059669" : "#7C3AED";
          return (
            <li key={emp.id}>
              <button
                onClick={() => onSelect(emp)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors cursor-pointer"
                style={{ backgroundColor: isSelected ? "#F9F6FF" : "" }}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-10 h-10 rounded-full object-cover object-top"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: statusColor }}
                  ></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isSelected ? "text-black" : "text-gray-700"}`}>
                    {emp.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{emp.role}</p>
                </div>
                {emp.status === "En riesgo" && (
                  <i className="ri-alert-line text-red-500 text-sm flex-shrink-0"></i>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}