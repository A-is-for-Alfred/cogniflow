import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Goal {
  id: number;
  text: string;
  done: boolean;
  category: string;
}

const initialGoals: Goal[] = [
  { id: 1, text: "Meditar 10 min al despertar", done: true, category: "wellness" },
  { id: 2, text: "Pausa activa al mediodía", done: true, category: "health" },
  { id: 3, text: "Documentar un aprendizaje del día", done: false, category: "growth" },
  { id: 4, text: "No revisar el celular 1 hora antes de dormir", done: false, category: "rest" },
  { id: 5, text: "Leer 20 páginas", done: false, category: "growth" },
];

const categoryColors: Record<string, { bg: string; color: string }> = {
  wellness: { bg: "#EDE9FE", color: "#7C3AED" },
  health: { bg: "#ECFDF5", color: "#059669" },
  growth: { bg: "#FFFBEB", color: "#D97706" },
  rest: { bg: "#F0F9FF", color: "#0EA5E9" },
};

export default function GoalsChecklist() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const toggle = (id: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  };

  const done = goals.filter((g) => g.done).length;
  const total = goals.length;
  const pct = Math.round((done / total) * 100);

  const categoryLabels: Record<string, string> = {
    wellness: t("goals.wellness"),
    health: t("goals.health"),
    growth: t("goals.growth"),
    rest: t("goals.rest"),
  };

  return (
    <div className="bg-white rounded-3xl p-6" style={{ border: "1px solid #F3F4F6" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-black">{t("goals.today_goals")}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{done} de {total} {t("goals.completed")}</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black"
          style={{
            background: `conic-gradient(#7C3AED ${pct * 3.6}deg, #F3F4F6 0deg)`,
            color: "#7C3AED",
          }}
        >
          <span className="bg-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-black">
            {pct}%
          </span>
        </div>
      </div>

      {/* Goals */}
      <ul className="space-y-2">
        {goals.map((g) => {
          const cat = categoryColors[g.category] ?? { bg: "#F3F4F6", color: "#6B7280" };
          return (
            <li key={g.id}>
              <button
                onClick={() => toggle(g.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left cursor-pointer"
                style={{ backgroundColor: g.done ? "#F9F6FF" : "#FAFAFA" }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: g.done ? "#7C3AED" : "#D1D5DB",
                    backgroundColor: g.done ? "#7C3AED" : "white",
                  }}
                >
                  {g.done && <i className="ri-check-line text-white text-xs"></i>}
                </div>
                <span className={`text-sm flex-1 ${g.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {g.text}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ backgroundColor: cat.bg, color: cat.color }}
                >
                  {categoryLabels[g.category] || g.category}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-center text-gray-400 mt-5">
        {t("goals.tap_to_complete")}
      </p>
    </div>
  );
}