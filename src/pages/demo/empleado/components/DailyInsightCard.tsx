import { useTranslation } from "react-i18next";

const insights = [
  {
    emoji: "✨",
    title: "Tu racha más larga fue de 14 días",
    body: "La semana pasada rompiste tu récord personal de constancia. Eso no es casualidad — es el resultado de pequeñas decisiones que tomaste cada día. Tu cerebro ya está aprendiendo que tú eres alguien que cumple sus compromisos.",
    color: "#7C3AED",
    bg: "#F9F6FF",
  },
  {
    emoji: "🌊",
    title: "Tu energía es más alta los miércoles",
    body: "El análisis de tus sesiones muestra que los miércoles llegas con más claridad y creatividad. Considera agendar tus tareas más importantes ese día.",
    color: "#0EA5E9",
    bg: "#F0F9FF",
  },
  {
    emoji: "🏆",
    title: "Completaste 5 objetivos este mes",
    body: "Cinco metas cumplidas en mayo — eso es un 40% más que el mes anterior. Tu progreso es real y medible. Sigue así.",
    color: "#059669",
    bg: "#F0FDF4",
  },
];

export default function DailyInsightCard() {
  const { t } = useTranslation();
  const insight = insights[new Date().getDay() % insights.length];

  return (
    <div
      className="rounded-3xl px-7 py-6 flex items-start gap-5"
      style={{ backgroundColor: insight.bg, border: `1px solid ${insight.color}22` }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: "white" }}
      >
        {insight.emoji}
      </div>
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: insight.color }}>
          {t("insight.title_prefix")}
        </p>
        <h3 className="text-base font-bold text-black mb-2">{insight.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{insight.body}</p>
      </div>
    </div>
  );
}