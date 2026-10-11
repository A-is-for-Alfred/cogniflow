import type { RoadmapData, ObjectiveScores } from "./roadmapTypes";

const SERIE_A = "#b1005d";
const SERIE_B = "#006c93";

interface RoadmapDecisionPlaneProps {
  data: RoadmapData;
  lang: "en" | "es";
}

export default function RoadmapDecisionPlane({
  data,
  lang,
}: RoadmapDecisionPlaneProps) {
  const t = {
    en: {
      title: "Why this order",
      caption: "Desirability vs Reachability",
      order: "Order",
      objective: "Objective",
      path: "Path",
      desirability: "Desirability",
      reachability: "Reachability",
      friction: "Friction",
      confidence: "Confidence",
    },
    es: {
      title: "Por qué este orden",
      caption: "Deseabilidad contra alcanzabilidad",
      order: "Orden",
      objective: "Objetivo",
      path: "Serie",
      desirability: "Deseabilidad",
      reachability: "Alcanzabilidad",
      friction: "Fricción",
      confidence: "Confianza",
    },
  }[lang];

  const objs = data.objectives;
  if (objs.length === 0) return null;

  const W = 720;
  const H = 360;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const plotW = W - margin.left - margin.right;
  const plotH = H - margin.top - margin.bottom;

  const allScores = objs
    .map((o) => o.scores)
    .filter((s): s is ObjectiveScores => !!s);
  const allVals = allScores.flatMap((s) => [
    s.desirability ?? 0,
    s.reachability ?? 0,
  ]);
  const minScore = Math.min(...allVals, 0);
  const maxScore = Math.max(...allVals, 100);
  const range = Math.max(maxScore - minScore, 20);
  const pad = range * 0.45;
  const xMin = Math.max(0, minScore - pad);
  const xMax = Math.min(100, maxScore + pad);
  const yMin = xMin;
  const yMax = xMax;

  const xScale = (v: number) =>
    margin.left + plotW - ((v - xMin) / (xMax - xMin)) * plotW;
  const yScale = (v: number) =>
    margin.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const ticks = [0, 25, 50, 75, 100].filter(
    (v) => v >= xMin && v <= xMax
  );

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
            aria-label={t.caption}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              fontFamily: "'Roboto Mono', monospace",
            }}
          >
            <line
              x1={margin.left}
              y1={margin.top + plotH}
              x2={margin.left + plotW}
              y2={margin.top + plotH}
              stroke="#d9d2cf"
              strokeWidth="1"
            />
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + plotH}
              stroke="#d9d2cf"
              strokeWidth="1"
            />
            {ticks.map((t) => (
              <text
                key={`x-${t}`}
                x={xScale(t)}
                y={margin.top + plotH + 18}
                textAnchor="middle"
                fontSize="11"
                fill="#867b77"
              >
                {t}
              </text>
            ))}
            {ticks.map((t) => (
              <text
                key={`y-${t}`}
                x={margin.left - 10}
                y={yScale(t) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#867b77"
              >
                {t}
              </text>
            ))}
            <text
              x={margin.left + plotW / 2}
              y={H - 8}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#6e0431"
            >
              {t.reachability}
            </text>
            <text
              x={16}
              y={margin.top + plotH / 2}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#6e0431"
              transform={`rotate(-90, 16, ${margin.top + plotH / 2})`}
            >
              {t.desirability}
            </text>
            {objs.map((obj) => {
              const s = obj.scores;
              if (!s || s.desirability == null || s.reachability == null)
                return null;
              const cx = xScale(s.reachability);
              const cy = yScale(s.desirability);
              const color = obj.path_code === "B" ? SERIE_B : SERIE_A;
              return (
                <g key={obj.order}>
                  <circle cx={cx} cy={cy} r="14" fill={color} opacity="0.15" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill={color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={cx}
                    y={cy - 14}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill={color}
                  >
                    {obj.order}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #d9d2cf",
            borderRadius: 4,
            marginTop: 14,
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: 13.5,
              minWidth: 540,
            }}
          >
            <thead>
              <tr style={{ background: "#6e0431", color: "#fff" }}>
                <th
                  style={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    padding: "9px 12px",
                  }}
                >
                  {t.order}
                </th>
                <th
                  style={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    padding: "9px 12px",
                  }}
                >
                  {t.objective}
                </th>
                <th
                  style={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    padding: "9px 12px",
                  }}
                >
                  {t.path}
                </th>
                <th
                  style={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    padding: "9px 12px",
                  }}
                >
                  {t.desirability}
                </th>
                <th
                  style={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    padding: "9px 12px",
                  }}
                >
                  {t.reachability}
                </th>
                <th
                  style={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    padding: "9px 12px",
                  }}
                >
                  {t.friction}
                </th>
                <th
                  style={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    padding: "9px 12px",
                  }}
                >
                  {t.confidence}
                </th>
              </tr>
            </thead>
            <tbody>
              {objs.map((obj, i) => (
                <tr
                  key={obj.order}
                  style={{
                    background: i % 2 === 1 ? "#faf7f8" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      verticalAlign: "top",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {obj.order}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      verticalAlign: "top",
                    }}
                  >
                    {obj.title_short || obj.title}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      verticalAlign: "top",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "3px 9px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        border: "1px solid #d9d2cf",
                        color: obj.path_code === "B" ? SERIE_B : SERIE_A,
                        background: obj.path_code === "B" ? "#eaf3f7" : "#f3e8ee",
                        maxWidth: "100%",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          flex: "none",
                          background: obj.path_code === "B" ? SERIE_B : SERIE_A,
                        }}
                      ></span>
                      {obj.path_code || "A"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      verticalAlign: "top",
                      fontFamily: "'Roboto Mono', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {obj.scores?.desirability ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      verticalAlign: "top",
                      fontFamily: "'Roboto Mono', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {obj.scores?.reachability ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      verticalAlign: "top",
                      fontFamily: "'Roboto Mono', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {obj.scores?.friction ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      verticalAlign: "top",
                    }}
                  >
                    {obj.scores?.confidence ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}