import type { Employee } from "../page";

interface EmployeeReportModalProps {
  employee: Employee;
  onClose: () => void;
}

function MetricRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-600 w-32">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-bold text-black w-10 text-right">{value}%</span>
    </div>
  );
}

export default function EmployeeReportModal({ employee, onClose }: EmployeeReportModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-14 h-14 rounded-full object-cover object-top"
              />
              <div>
                <h3 className="text-xl font-bold text-black">{employee.name}</h3>
                <p className="text-sm text-gray-500">{employee.role} · {employee.department}</p>
                <p className="text-xs text-gray-400 mt-0.5">Última sesión: {employee.lastSession}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-gray-500"></i>
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="px-8 py-6 space-y-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Indicadores de bienestar</h4>
          <MetricRow label="Felicidad" value={employee.happiness} color="#7C3AED" />
          <MetricRow label="Productividad" value={employee.productivity} color="#059669" />
          <MetricRow label="Burnout" value={employee.burnout} color="#EF4444" />
          <MetricRow label="Estrés" value={employee.stress} color="#D97706" />
          <MetricRow label="Engagement" value={employee.engagement} color="#0EA5E9" />
        </div>

        {/* Report summary */}
        <div className="px-8 py-6">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resumen del reporte</h4>
          <div
            className="rounded-2xl p-5 text-sm text-gray-700 leading-relaxed"
            style={{ backgroundColor: "#F9F6FF" }}
          >
            <i className="ri-file-text-line text-purple-400 mr-2"></i>
            {employee.reportSummary}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-right">
            Generado por Cogniflow · {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-semibold px-6 py-2.5 rounded-full text-white cursor-pointer"
            style={{ backgroundColor: "#7C3AED" }}
          >
            Cerrar reporte
          </button>
        </div>
      </div>
    </div>
  );
}