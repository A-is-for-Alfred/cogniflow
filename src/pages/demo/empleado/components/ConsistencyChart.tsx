import { useTranslation } from "react-i18next";

const weeks = ["L", "M", "X", "J", "V", "S", "D"];

const history = [
  [1, 1, 0, 1, 1, 0, 0],
  [1, 1, 1, 1, 0, 1, 0],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 0],
];

const streak = 3;

export default function ConsistencyChart() {
  const { t } = useTranslation();

  const weekLabels = [
    t("consistency.week_3_ago"),
    t("consistency.week_2_ago"),
    t("consistency.week_last"),
    t("consistency.week_current"),
  ];

  const total = history.flat().filter(Boolean).length;
  const possible = history.flat().length;
  const pct = Math.round((total / possible) * 100);

  return (
    <div className="bg-white rounded-3xl p-6" style={{ border: "1px solid #F3F4F6" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-black">{t("consistency.title")}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{t("consistency.last_4_weeks")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
          <i className="ri-fire-line"></i>
          {streak} {t("consistency.days_streak")}
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-2 mb-5">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weeks.map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium">
              {d}
            </div>
          ))}
        </div>
        {history.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className="h-7 rounded-md transition-all"
                style={{
                  backgroundColor: day ? "#7C3AED" : "#F3F4F6",
                  opacity: day ? (0.5 + wi * 0.15) : 1,
                }}
                title={`${weekLabels[wi]} · ${weeks[di]}: ${day ? t("consistency.session_done") : t("consistency.no_session")}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-black text-black">{total}</p>
          <p className="text-xs text-gray-400">{t("consistency.sessions")}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-black">{pct}%</p>
          <p className="text-xs text-gray-400">{t("consistency.consistency")}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black" style={{ color: "#7C3AED" }}>{streak}</p>
          <p className="text-xs text-gray-400">{t("consistency.current_streak")}</p>
        </div>
      </div>

      <div
        className="mt-4 rounded-xl px-4 py-3 text-xs text-gray-600 leading-relaxed"
        style={{ backgroundColor: "#F9F6FF" }}
      >
        <i className="ri-sparkling-line text-purple-400 mr-1.5"></i>
        {t("consistency.motivation", { pct })}
      </div>
    </div>
  );
}