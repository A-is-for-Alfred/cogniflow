import { useState } from "react";
import type { CoachEmployee } from "../page";

interface CoachDetailPanelProps {
  employee: CoachEmployee;
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span className="font-bold text-black">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function CoachDetailPanel({ employee }: CoachDetailPanelProps) {
  const [goals, setGoals] = useState(employee.goals);
  const [newGoal, setNewGoal] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [scheduledMsg, setScheduledMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"report" | "goals" | "notes">("report");

  const toggleGoal = (id: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals((prev) => [
      ...prev,
      { id: Date.now(), text: newGoal.trim(), done: false, dueDate: "Sin fecha" },
    ]);
    setNewGoal("");
  };

  const removeGoal = (id: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSchedule = () => {
    if (!selectedDate) return;
    setScheduledMsg(`Sesión agendada para el ${selectedDate} a las ${selectedTime}`);
    setShowScheduler(false);
  };

  const tabs = [
    { key: "report", label: "Reporte detallado", icon: "ri-file-chart-line" },
    { key: "goals", label: "Objetivos", icon: "ri-flag-line" },
    { key: "notes", label: "Notas de sesión", icon: "ri-sticky-note-line" },
  ] as const;

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      {/* Employee header */}
      <div className="bg-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between" style={{ border: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-4">
          <img src={employee.avatar} alt={employee.name} className="w-14 h-14 rounded-full object-cover object-top" />
          <div>
            <h2 className="text-xl font-bold text-black">{employee.name}</h2>
            <p className="text-sm text-gray-500">{employee.role} · {employee.department}</p>
            <p className="text-xs text-gray-400 mt-1">Última sesión: {employee.lastSession}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {employee.nextSession ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 px-4 py-2 rounded-full">
              <i className="ri-calendar-check-line"></i>
              <span>{employee.nextSession}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full">
              <i className="ri-calendar-close-line"></i>
              Sin sesión agendada
            </div>
          )}
          <button
            onClick={() => setShowScheduler(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-full cursor-pointer"
            style={{ backgroundColor: "#059669" }}
          >
            <i className="ri-calendar-line"></i>
            Agendar sesión
          </button>
        </div>
      </div>

      {scheduledMsg && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4 text-sm text-green-700 font-medium">
          <i className="ri-checkbox-circle-line text-lg"></i>
          {scheduledMsg}
          <button onClick={() => setScheduledMsg("")} className="ml-auto cursor-pointer text-green-500 hover:text-green-700">
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Weekly insight */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-start gap-4"
        style={{ backgroundColor: "#F9F6FF", border: "1px solid #EDE9FE" }}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: "#EDE9FE" }}>
          <i className="ri-sparkling-line text-purple-600 text-sm"></i>
        </div>
        <div>
          <p className="text-xs font-semibold text-purple-700 mb-1">Insight semanal de Cogniflow</p>
          <p className="text-sm text-gray-700 leading-relaxed">{employee.weeklyInsight}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ border: "1px solid #F3F4F6" }}>
        <MetricBar label="Felicidad" value={employee.happiness} color="#7C3AED" />
        <MetricBar label="Productividad" value={employee.productivity} color="#059669" />
        <MetricBar label="Burnout" value={employee.burnout} color="#EF4444" />
        <MetricBar label="Estrés" value={employee.stress} color="#D97706" />
        <MetricBar label="Engagement" value={employee.engagement} color="#0EA5E9" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-full p-1 self-start w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === t.key ? "white" : "transparent",
              color: activeTab === t.key ? "#059669" : "#6B7280",
            }}
          >
            <i className={t.icon}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "report" && (
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #F3F4F6" }}>
          <h3 className="text-sm font-bold text-black mb-4">Reporte clínico-conductual detallado</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{employee.reportDetail}</p>
        </div>
      )}

      {activeTab === "goals" && (
        <div className="bg-white rounded-2xl p-6 space-y-3" style={{ border: "1px solid #F3F4F6" }}>
          <h3 className="text-sm font-bold text-black mb-4">Lista de objetivos — editable</h3>
          {goals.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-colors"
              style={{ backgroundColor: g.done ? "#F0FDF4" : "#F9FAFB" }}
            >
              <button
                onClick={() => toggleGoal(g.id)}
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                style={{
                  borderColor: g.done ? "#10B981" : "#D1D5DB",
                  backgroundColor: g.done ? "#10B981" : "white",
                }}
              >
                {g.done && <i className="ri-check-line text-white text-xs"></i>}
              </button>
              <span className={`text-sm flex-1 ${g.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                {g.text}
              </span>
              <span className="text-xs text-gray-400">{g.dueDate}</span>
              <button onClick={() => removeGoal(g.id)} className="cursor-pointer text-gray-300 hover:text-red-400 transition-colors ml-1">
                <i className="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          ))}
          {/* Add goal */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              placeholder="Agregar nuevo objetivo…"
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400"
            />
            <button
              onClick={addGoal}
              className="text-sm font-semibold text-white px-4 py-2.5 rounded-xl cursor-pointer"
              style={{ backgroundColor: "#059669" }}
            >
              Agregar
            </button>
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #F3F4F6" }}>
          <h3 className="text-sm font-bold text-black mb-4">Notas privadas del coach</h3>
          <div
            className="rounded-xl p-4 text-sm text-gray-700 leading-relaxed mb-4"
            style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
          >
            <i className="ri-lock-line text-yellow-500 mr-2"></i>
            Solo visible para la coach. No se comparte con la empresa ni con el colaborador.
          </div>
          <textarea
            defaultValue={employee.sessionNotes}
            rows={6}
            className="w-full text-sm text-gray-700 leading-relaxed p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 resize-none"
            placeholder="Escribe tus notas para la próxima sesión…"
          />
        </div>
      )}

      {/* Schedule modal */}
      {showScheduler && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowScheduler(false); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-md p-8">
            <h3 className="text-lg font-bold text-black mb-1">Agendar sesión 1:1</h3>
            <p className="text-sm text-gray-500 mb-6">con {employee.name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Hora</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 bg-white cursor-pointer"
                >
                  {["08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowScheduler(false)}
                className="flex-1 text-sm font-semibold py-3 rounded-full border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSchedule}
                className="flex-1 text-sm font-semibold py-3 rounded-full text-white cursor-pointer"
                style={{ backgroundColor: "#059669" }}
              >
                Confirmar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}