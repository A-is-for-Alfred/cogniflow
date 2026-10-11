import type { RoadmapData } from "./roadmapTypes";

interface RoadmapIndicatorsProps {
  data: RoadmapData;
  lang: "en" | "es";
}

export default function RoadmapIndicators({
  data,
  lang,
}: RoadmapIndicatorsProps) {
  const kpis = data.roadmap_kpis;
  if (!kpis) return null;

  const nf = new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US");

  const items = [
    {
      k: lang === "es" ? "Objetivos" : "Objectives",
      v: kpis.objectives_total,
      u: "",
    },
    {
      k: lang === "es" ? "Victorias rápidas" : "Quick wins",
      v: kpis.quick_wins,
      u: "",
    },
    {
      k: lang === "es" ? "Cumbres" : "Summits",
      v: kpis.summit,
      u: "",
    },
    {
      k: lang === "es" ? "Horizonte (semanas)" : "Horizon (weeks)",
      v: kpis.horizon_weeks,
      u: "",
    },
    {
      k: lang === "es" ? "Compromiso semanal" : "Weekly commitment",
      v: kpis.weekly_time_commitment_min,
      u: "min",
    },
    {
      k: lang === "es" ? "Datos por semana" : "Data points/week",
      v: kpis.data_points_per_week,
      u: "",
    },
    {
      k: lang === "es" ? "Línea base comp." : "Baseline comp.",
      v: kpis.baseline_composite_pct,
      u: "%",
    },
    {
      k: lang === "es" ? "Meta comp." : "Target comp.",
      v: kpis.target_composite_pct,
      u: "%",
    },
  ].filter((i) => i.v != null);

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(158px, 1fr))",
        gap: 1,
        background: "#d9d2cf",
        border: "1px solid #d9d2cf",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 24,
      }}
      aria-label={lang === "es" ? "Indicadores del roadmap" : "Roadmap indicators"}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: "#fff",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#b1005d",
            }}
          >
            {item.k}
          </div>
          <div
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontVariantNumeric: "tabular-nums",
              fontSize: 25,
              fontWeight: 500,
              lineHeight: 1.1,
              color: "#6e0431",
              overflowWrap: "anywhere",
            }}
          >
            {nf.format(item.v)}
            <span
              style={{
                fontSize: 13,
                color: "#867b77",
                marginLeft: 4,
              }}
            >
              {item.u}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}