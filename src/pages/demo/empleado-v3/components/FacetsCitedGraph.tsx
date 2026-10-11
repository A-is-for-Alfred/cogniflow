/**
 * Facetas citadas — gráfica que reconstruye el estilo de "Mis facetas"
 * pero sólo con los ejes (facetas) citados en la intro de la pregunta.
 *
 * A diferencia de la versión anterior, aquí NO se confía en un `score`/
 * `preference` que venga dentro de `facets_cited`. En su lugar, cada eje
 * citado se resuelve contra las facetas originales del empleado
 * (`resultados_facetas` + `cat_facetas`) para traer sus valores reales:
 * score, polos, clasificación y dimensión.
 */

export interface ResolvedFacet {
  key: string;
  /** Nombre del eje (par), p.ej. "Initiating-Receiving" */
  name: string;
  leftPole: string;
  rightPole: string;
  /** 0–5 */
  score: number;
  /** Polo ganador (texto), p.ej. "Initiating" */
  wonPole: string;
  /** in-preference | out-of-preference | midzone */
  classification: string;
}

interface FacetsCitedGraphProps {
  facets: ResolvedFacet[];
  lang: "en" | "es";
}

const SCORE_COLORS: Record<string, string> = {
  "in-preference": "#10B981",
  "out-of-preference": "#EF4444",
  midzone: "#9CA3AF",
};

const CLASS_LABELS: Record<string, { en: string; es: string }> = {
  "in-preference": { en: "In preference", es: "En preferencia" },
  "out-of-preference": { en: "Out of preference", es: "Fuera de preferencia" },
  midzone: { en: "Midzone", es: "Zona media" },
};

export default function FacetsCitedGraph({ facets, lang }: FacetsCitedGraphProps) {
  if (!facets || facets.length === 0) return null;

  const title = lang === "es" ? "Facetas citadas" : "Cited facets";

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0e9ec" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <i className="ri-bar-chart-2-line" style={{ fontSize: 13, color: "#b1005d" }}></i>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#b1005d",
          }}
        >
          {title}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {facets.map((f) => {
          const color = SCORE_COLORS[f.classification] || "#9CA3AF";
          const classLabel = CLASS_LABELS[f.classification]?.[lang] || f.classification;

          const scorePercent = Math.max(0, Math.min(100, (f.score / 5) * 100));
          const barWidth = scorePercent / 2;
          const isZeroScore = f.score === 0;

          const wonLeft = f.wonPole === f.leftPole;

          // Bar grows from center toward the winning pole
          const barLeft = wonLeft ? `${50 - barWidth}%` : "50%";
          const dotLeft = isZeroScore
            ? "50%"
            : wonLeft
              ? `${50 - barWidth}%`
              : `${50 + barWidth}%`;

          return (
            <div key={f.key}>
              {/* Title + score */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: "#3d3d3d", lineHeight: 1.3 }}>
                  {f.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                      background: `${color}1a`,
                      padding: "1px 7px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {classLabel}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#867b77", whiteSpace: "nowrap" }}>
                    {f.score}
                  </span>
                </div>
              </div>

              {/* Bidirectional bar */}
              <div
                style={{
                  position: "relative",
                  height: 8,
                  borderRadius: 999,
                  background: "#f0e9ec",
                  overflow: "hidden",
                  marginBottom: 4,
                }}
              >
                {/* Center marker */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: "50%",
                    width: 2,
                    background: "#d9d2cf",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                  }}
                />
                {/* Bar from center toward winning pole */}
                {barWidth > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      height: "100%",
                      width: `${barWidth}%`,
                      left: barLeft,
                      background: color,
                      borderRadius: 999,
                      transition: "width 0.7s ease",
                    }}
                  />
                )}
                {/* Dot at the end of the bar */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    background: color,
                    left: dotLeft,
                    transform: "translate(-50%, -50%)",
                    zIndex: 20,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
                  }}
                />
              </div>

              {/* Pole labels */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isZeroScore ? 500 : wonLeft ? 700 : 500,
                    color: isZeroScore ? "#9CA3AF" : wonLeft ? color : "#9CA3AF",
                    lineHeight: 1.3,
                  }}
                >
                  {f.leftPole}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isZeroScore ? 500 : !wonLeft ? 700 : 500,
                    color: isZeroScore ? "#9CA3AF" : !wonLeft ? color : "#9CA3AF",
                    lineHeight: 1.3,
                    textAlign: "right",
                  }}
                >
                  {f.rightPole}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}