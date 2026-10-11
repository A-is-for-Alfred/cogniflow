import type { RoadmapData } from "./roadmapTypes";

const SERIE_A = "#b1005d";
const SERIE_B = "#006c93";

interface RoadmapElevationProps {
  data: RoadmapData;
  lang: "en" | "es";
}

export default function RoadmapElevation({ data, lang }: RoadmapElevationProps) {
  const t = {
    en: {
      title: "Elevation Profile",
      caption: "Altitude = accumulated progress · ascent order",
      legendA: "Path A · reframe of own tension",
      legendB: "Path B · corporate matrix",
    },
    es: {
      title: "Perfil de elevación",
      caption: "Altitud = avance acumulado · orden de ascenso",
      legendA: "Path A · reencuadre de una tensión propia",
      legendB: "Path B · matriz corporativa",
    },
  }[lang];

  const objs = data.objectives;
  if (objs.length === 0) return null;

  const W = 1000;
  const H = 340;
  const groundY = 310;
  const marginX = 80;
  const availableW = W - 2 * marginX;
  const stepX = objs.length > 1 ? availableW / (objs.length - 1) : 0;

  const points = objs.map((obj, i) => {
    const x = objs.length > 1 ? marginX + i * stepX : W / 2;
    const alt = obj.mountain_stage?.altitude_pct ?? 0;
    const y = groundY - (alt / 100) * (groundY - 60);
    return { x, y, obj, i };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #d9d2cf",
        borderRadius: 6,
        boxShadow:
          "0 1px 2px rgba(61,61,61,.06), 0 6px 18px -10px rgba(110,4,49,.18)",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
          padding: "18px 20px 0",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#8f0f48",
            margin: 0,
          }}
        >
          {t.title}
        </h2>
        <span style={{ fontSize: 13, color: "#867b77" }}>{t.caption}</span>
      </div>
      <div style={{ padding: "14px 20px 20px" }}>
        <div style={{ overflowX: "auto" }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={t.title}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              fontFamily: "'Roboto Mono', monospace",
            }}
          >
            <line
              x1="0"
              y1={groundY}
              x2={W}
              y2={groundY}
              stroke="#d9d2cf"
              strokeWidth="1"
            />
            <path
              d={pathD}
              fill="none"
              stroke="#8f0f48"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p) => {
              const color = p.obj.path_code === "B" ? SERIE_B : SERIE_A;
              return (
                <g
                  key={p.i}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    document
                      .getElementById(`obj-${p.obj.order}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      document
                        .getElementById(`obj-${p.obj.order}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="22"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.25"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill={color}
                    stroke="#fff"
                    strokeWidth="2.5"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill="#fff"
                  >
                    {p.obj.order}
                  </text>
                  <text
                    x={p.x}
                    y={groundY + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#867b77"
                  >
                    {p.obj.mountain_stage?.camp || `Camp ${p.obj.order}`}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill={color}
                  >
                    {p.obj.mountain_stage?.altitude_pct ?? 0}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div
          style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 10 }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                display: "block",
                background: SERIE_A,
              }}
            ></span>
            {t.legendA}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 3,
                display: "block",
                background: SERIE_B,
              }}
            ></span>
            {t.legendB}
          </span>
        </div>
      </div>
    </section>
  );
}