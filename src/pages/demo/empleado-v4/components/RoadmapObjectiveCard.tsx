import { useState } from "react";
import type { RoadmapObjective } from "./roadmapTypes";

const SERIE_A = "#b1005d";
const SERIE_B = "#006c93";

const serieColor = (obj: RoadmapObjective) =>
  obj.path_code === "B" ? SERIE_B : SERIE_A;

interface RoadmapObjectiveCardProps {
  obj: RoadmapObjective;
  lang: "en" | "es";
  mode: "datos" | "narrativa";
}

export default function RoadmapObjectiveCard({
  obj,
  lang,
  mode,
}: RoadmapObjectiveCardProps) {
  const [narrativeOpen, setNarrativeOpen] = useState(false);

  const t = {
    en: {
      mountain_types: { "Quick Win": "Quick Win", "The Summit": "The Summit" },
      smart: "Smart Metric",
      baseline: "Baseline",
      target: "Target",
      stretch: "Stretch",
      milestones: "Milestones",
      week: "Week",
      desirability: "Desirability",
      reachability: "Reachability",
      friction: "Friction",
      firstAction: "First action",
      risk: "Risk",
      earlyWarning: "Early warning",
      mitigation: "Mitigation",
      rationale: "Strategic reasoning",
      showRationale: "Show rationale",
      hideRationale: "Hide rationale",
      reframeFrom: "Reframe from",
      reframeTo: "Reframe to",
      specific: "Specific",
      achievable: "Achievable",
      relevant: "Relevant",
    },
    es: {
      mountain_types: {
        "Quick Win": "Victoria Rápida",
        "The Summit": "La Cumbre",
      },
      smart: "Métrica SMART",
      baseline: "Línea base",
      target: "Meta",
      stretch: "Stretch",
      milestones: "Hitos",
      week: "Semana",
      desirability: "Deseabilidad",
      reachability: "Alcanzabilidad",
      friction: "Fricción",
      firstAction: "Primera acción",
      risk: "Riesgo",
      earlyWarning: "Señal temprana",
      mitigation: "Mitigación",
      rationale: "Razonamiento estratégico",
      showRationale: "Ver razonamiento",
      hideRationale: "Ocultar",
      reframeFrom: "Reencuadre desde",
      reframeTo: "Hacia",
      specific: "Específico",
      achievable: "Alcanzable",
      relevant: "Relevante",
    },
  }[lang];

  const color = serieColor(obj);
  const m = obj.smart?.measurable;
  const nf = new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US");

  const axisPos = (v: number) => {
    if (!m) return 0;
    const lo = Math.min(m.baseline ?? 0, m.target ?? 0, m.stretch ?? m.target ?? 0);
    const hi = Math.max(m.baseline ?? 0, m.target ?? 0, m.stretch ?? m.target ?? 0);
    const rng = Math.max(hi - lo, 1);
    return ((v - lo) / rng) * 100;
  };

  const mountainTypeLabel =
    t.mountain_types[obj.mountain_type as keyof typeof t.mountain_types] ||
    obj.mountain_type;

  const openOnNarrative = mode === "narrativa";
  const open = openOnNarrative || narrativeOpen;

  return (
    <div
      id={`obj-${obj.order}`}
      style={{
        background: "#fff",
        border: "1px solid #d9d2cf",
        borderRadius: 6,
        boxShadow:
          "0 1px 2px rgba(61,61,61,.06), 0 6px 18px -10px rgba(110,4,49,.18)",
        overflow: "hidden",
        scrollMarginTop: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "18px 20px",
          borderBottom: "1px solid #d9d2cf",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 46,
            height: 46,
            borderRadius: 6,
            display: "grid",
            placeItems: "center",
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 21,
            fontWeight: 700,
            color: "#fff",
            background: color,
          }}
        >
          {obj.order}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}
          >
            {mountainTypeLabel && (
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
                  border: "1px solid",
                  borderColor: color,
                  color: color,
                  background: color === SERIE_A ? "#f3e8ee" : "#eaf3f7",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    flex: "none",
                    background: color,
                  }}
                ></span>
                Path {obj.path_code} · {mountainTypeLabel}
              </span>
            )}
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#6e0431",
              lineHeight: 1.3,
              margin: "0 0 8px",
              overflowWrap: "anywhere",
            }}
          >
            {obj.title}
          </h3>
          {obj.source?.reframe_from && (
            <div style={{ marginTop: 8, fontSize: 14, color: "#3d3d3d" }}>
              <span style={{ color: "#867b77", fontWeight: 600 }}>
                {t.reframeFrom}:{" "}
              </span>
              <em style={{ fontStyle: "italic" }}>«{obj.source.reframe_from}»</em>
              {obj.source.reframe_to && (
                <>
                  {" "}
                  <span style={{ color: "#867b77" }}>→</span>{" "}
                  <em>«{obj.source.reframe_to}»</em>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
        }}
      >
        <div
          style={{ padding: "18px 20px", minWidth: 0 }}
        >
          {m && (
            <>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#b1005d",
                }}
              >
                {t.smart}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontVariantNumeric: "tabular-nums",
                    marginTop: 4,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 18, color: "#867b77" }}>
                    {nf.format(m.baseline)}
                  </span>
                  <span style={{ fontSize: 15, color: "#867b77" }}>→</span>
                  <span
                    style={{
                      fontSize: 31,
                      fontWeight: 700,
                      lineHeight: 1.05,
                      color: "#6e0431",
                    }}
                  >
                    {nf.format(m.target)}
                  </span>
                  <span style={{ fontSize: 14, color: "#867b77" }}>
                    {m.unit}
                  </span>
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 14,
                  borderRadius: 3,
                  background: "#faf7f8",
                  border: "1px solid #d9d2cf",
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${Math.min(axisPos(m.baseline), axisPos(m.target))}%`,
                    width: `${Math.abs(axisPos(m.target) - axisPos(m.baseline))}%`,
                    borderRadius: 2,
                    background: color,
                    opacity: 0.45,
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    bottom: -4,
                    left: `${axisPos(m.baseline)}%`,
                    width: 3,
                    borderRadius: 2,
                    transform: "translateX(-1.5px)",
                    background: "#867b77",
                  }}
                ></div>
                {m.stretch != null && (
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      bottom: -4,
                      left: `${axisPos(m.stretch)}%`,
                      width: 2,
                      borderRadius: 2,
                      transform: "translateX(-1px)",
                      background: "#d9d2cf",
                    }}
                  ></div>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
                  gap: 1,
                  marginTop: 12,
                  background: "#d9d2cf",
                  border: "1px solid #d9d2cf",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {[
                  { k: t.baseline, v: `${nf.format(m.baseline)} ${m.unit}` },
                  { k: t.target, v: `${nf.format(m.target)} ${m.unit}` },
                  ...(m.stretch != null
                    ? [{ k: t.stretch, v: `${nf.format(m.stretch)} ${m.unit}` }]
                    : []),
                ].map((cell, ci) => (
                  <div
                    key={ci}
                    style={{ background: "#fff", padding: "7px 10px", minWidth: 0 }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#867b77",
                      }}
                    >
                      {cell.k}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#6e0431",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {cell.v}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {obj.milestones && obj.milestones.length > 0 && (
            <div
              style={{
                marginTop: 18,
                paddingTop: 15,
                borderTop: "1px solid #d9d2cf",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#b1005d",
                  marginBottom: 8,
                }}
              >
                {t.milestones}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(148px, 1fr))",
                  gap: 1,
                  background: "#d9d2cf",
                  border: "1px solid #d9d2cf",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {obj.milestones.map((ms, mi) => (
                  <div
                    key={mi}
                    style={{
                      background: "#fff",
                      padding: "9px 11px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#867b77",
                      }}
                    >
                      {t.week} {ms.week}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 17,
                        fontWeight: 700,
                        color: color,
                      }}
                    >
                      {nf.format(ms.target_value)}{" "}
                      <span style={{ fontSize: 12, color: "#867b77" }}>
                        {m?.unit}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.35,
                        color: "#3d3d3d",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {ms.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {obj.smart && (
            <div
              style={{
                marginTop: 18,
                borderTop: "1px solid #d9d2cf",
              }}
            >
              {[
                { k: "S", label: t.specific, v: obj.smart.specific },
                { k: "A", label: t.achievable, v: obj.smart.achievable },
                { k: "R", label: t.relevant, v: obj.smart.relevant },
              ]
                .filter((row) => row.v)
                .map((row) => (
                  <div
                    key={row.k}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "96px minmax(0,1fr)",
                      gap: 14,
                      padding: "10px 0",
                      borderBottom: "1px solid #d9d2cf",
                      alignItems: "baseline",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#b1005d",
                      }}
                    >
                      {row.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {row.v}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "18px 20px",
            minWidth: 0,
            borderLeft: "1px solid #d9d2cf",
          }}
        >
          {obj.scores && (
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {[
                {
                  label: t.desirability,
                  value: obj.scores.desirability,
                  col: color,
                },
                {
                  label: t.reachability,
                  value: obj.scores.reachability,
                  col: color,
                },
                {
                  label: t.friction,
                  value: obj.scores.friction,
                  col: "#f5802c",
                },
              ].map((meter, mi) =>
                meter.value != null ? (
                  <div key={mi}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: "#867b77",
                        }}
                      >
                        {meter.label}
                      </span>
                      <b
                        style={{
                          fontFamily: "'Roboto Mono', monospace",
                          fontSize: 15,
                          color: "#6e0431",
                        }}
                      >
                        {meter.value}
                      </b>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 3,
                        background: "#faf7f8",
                        border: "1px solid #d9d2cf",
                        marginTop: 5,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <i
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: 0,
                          display: "block",
                          borderRadius: 2,
                          width: `${meter.value}%`,
                          background: meter.col,
                        }}
                      ></i>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}

          {obj.first_action?.what && (
            <div
              style={{
                marginTop: 18,
                paddingTop: 15,
                borderTop: "1px solid #d9d2cf",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                  padding: "12px 13px",
                  borderRadius: 4,
                  background: "#f3e8ee",
                  border: "1px solid #b1005d",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    display: "grid",
                    placeItems: "center",
                    background: "#b1005d",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  1
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.45,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {obj.first_action.what}
                  </div>
                  {obj.first_action.when && (
                    <div
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: 12,
                        color: "#867b77",
                        marginTop: 3,
                      }}
                    >
                      {obj.first_action.when}
                      {obj.first_action.duration_min
                        ? ` · ${obj.first_action.duration_min} min`
                        : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {obj.risk?.name && (
            <div
              style={{
                marginTop: 11,
                padding: "12px 13px",
                borderRadius: 4,
                background: "#fdf3ea",
                border: "1px solid #f5802c",
                borderLeftWidth: 4,
              }}
            >
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#c45f12",
                  overflowWrap: "anywhere",
                }}
              >
                ⚠ {obj.risk.name}
              </div>
              {obj.risk.mitigation && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#3d3d3d",
                    marginTop: 5,
                    lineHeight: 1.5,
                    overflowWrap: "anywhere",
                  }}
                >
                  {obj.risk.mitigation}
                </div>
              )}
            </div>
          )}

          {obj.justification && (
            <div
              style={{
                borderTop: "1px solid #d9d2cf",
                marginTop: 18,
                background: "#faf7f8",
              }}
            >
              <button
                type="button"
                onClick={() => setNarrativeOpen((o) => !o)}
                style={{
                  cursor: "pointer",
                  listStyle: "none",
                  padding: "13px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#006c93",
                  background: "none",
                  border: "none",
                  fontFamily: "inherit",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: 15,
                    lineHeight: 1,
                  }}
                >
                  {open ? "–" : "+"}
                </span>
                {open ? t.hideRationale : t.showRationale}
              </button>
              {open && (
                <div style={{ paddingBottom: 20 }}>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      maxWidth: "75ch",
                      overflowWrap: "anywhere",
                      margin: 0,
                    }}
                  >
                    {obj.justification}
                  </p>
                  {obj.rationale?.headline && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "10px 13px",
                        borderRadius: 4,
                        background: "#faf7f8",
                        border: "1px solid #d9d2cf",
                        fontSize: 16,
                        lineHeight: 1.5,
                        color: "#6e0431",
                        fontWeight: 600,
                      }}
                    >
                      {obj.rationale.headline}
                    </div>
                  )}
                  {obj.rationale?.why_this_position && (
                    <p
                      style={{
                        fontSize: 14,
                        marginTop: 10,
                        color: "#3d3d3d",
                        lineHeight: 1.55,
                      }}
                    >
                      {obj.rationale.why_this_position}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}