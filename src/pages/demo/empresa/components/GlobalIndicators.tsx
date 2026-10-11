import type { Employee } from "../page";

interface GlobalIndicatorsProps {
  employees: Employee[];
}

function avg(arr: number[]) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function RingGauge({ value, color, label, sublabel }: { value: number; color: string; label: string; sublabel: string }) {
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg width="80" height="80" className="rotate-[-90deg]">
          <circle
            cx="40" cy="40" r={normalizedRadius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={stroke}
          />
          <circle
            cx="40" cy="40" r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <span className="absolute text-sm font-black text-black">{value}%</span>
      </div>
      <p className="text-xs font-semibold text-black mt-2 text-center">{label}</p>
      <p className="text-xs text-gray-400 text-center">{sublabel}</p>
    </div>
  );
}

export default function GlobalIndicators({ employees }: GlobalIndicatorsProps) {
  const happinessAvg = avg(employees.map((e) => e.happiness));
  const productivityAvg = avg(employees.map((e) => e.productivity));
  const burnoutAvg = avg(employees.map((e) => e.burnout));
  const stressAvg = avg(employees.map((e) => e.stress));
  const engagementAvg = avg(employees.map((e) => e.engagement));
  const atRisk = employees.filter((e) => e.status === "En riesgo").length;
  const excellent = employees.filter((e) => e.status === "Excelente").length;

  const mainMetrics = [
    { label: "Índice de Felicidad", value: happinessAvg, icon: "ri-emotion-happy-line", color: "#7C3AED", bg: "#EDE9FE", trend: "+4 pts vs. mes anterior" },
    { label: "Productividad", value: productivityAvg, icon: "ri-line-chart-line", color: "#059669", bg: "#ECFDF5", trend: "+2 pts vs. mes anterior" },
    { label: "Índice de Burnout", value: burnoutAvg, icon: "ri-fire-line", color: "#DC2626", bg: "#FEF2F2", trend: "−8 pts vs. mes anterior", invert: true },
    { label: "Nivel de Estrés", value: stressAvg, icon: "ri-mental-health-line", color: "#D97706", bg: "#FFFBEB", trend: "−5 pts vs. mes anterior", invert: true },
    { label: "Engagement", value: engagementAvg, icon: "ri-heart-pulse-line", color: "#0EA5E9", bg: "#F0F9FF", trend: "+6 pts vs. mes anterior" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-black">Panorama general</h2>
          <p className="text-sm text-gray-400">Promedio de {employees.length} colaboradores · Mayo 2026</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <i className="ri-user-star-line"></i>
            {excellent} en excelente estado
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-full">
            <i className="ri-alert-line"></i>
            {atRisk} en riesgo
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {mainMetrics.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid #F3F4F6" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ backgroundColor: m.bg, color: m.color }}
              >
                <i className={m.icon}></i>
              </div>
              {m.invert ? (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {m.trend}
                </span>
              ) : (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {m.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-3xl font-black text-black">{m.value}%</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{m.label}</p>
            </div>
            {/* Mini bar */}
            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${m.value}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Ring gauges secondary */}
      <div className="mt-6 bg-white rounded-2xl p-6 flex flex-wrap items-center justify-around gap-6" style={{ border: "1px solid #F3F4F6" }}>
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">Vista comparativa</p>
        </div>
        <RingGauge value={happinessAvg} color="#7C3AED" label="Felicidad" sublabel="Equipo completo" />
        <RingGauge value={productivityAvg} color="#059669" label="Productividad" sublabel="Equipo completo" />
        <RingGauge value={burnoutAvg} color="#DC2626" label="Burnout" sublabel="(menor = mejor)" />
        <RingGauge value={stressAvg} color="#D97706" label="Estrés" sublabel="(menor = mejor)" />
        <RingGauge value={engagementAvg} color="#0EA5E9" label="Engagement" sublabel="Equipo completo" />
        <div className="text-center hidden lg:block">
          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white mb-2"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}
            >
              B+
            </div>
            <p className="text-xs font-semibold text-black">Salud Org.</p>
            <p className="text-xs text-gray-400">Calificación global</p>
          </div>
        </div>
      </div>
    </section>
  );
}