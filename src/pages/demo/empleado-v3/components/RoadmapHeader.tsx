import type { RoadmapData } from "./roadmapTypes";

interface RoadmapHeaderProps {
  lang: "en" | "es";
  data: RoadmapData;
  mode: "datos" | "narrativa";
  onModeChange: (m: "datos" | "narrativa") => void;
}

export default function RoadmapHeader({
  lang,
  data,
  mode,
  onModeChange,
}: RoadmapHeaderProps) {
  const t = {
    en: {
      eyebrow: "Strategic Roadmap",
      modeLabel: "Reading mode",
      data: "Data",
      narrative: "Narrative",
    },
    es: {
      eyebrow: "Roadmap Estratégico",
      modeLabel: "Modo de lectura",
      data: "Datos",
      narrative: "Narrativa",
    },
  }[lang];

  const profile = data.reader_profile;
  const headline =
    data.summary_blocks?.headline || data.roadmap_summary || "";
  const lede = data.summary_blocks?.opening_hook || "";
  const meta = profile
    ? `${profile.mbti_base} · ${profile.display_name}`
    : "";

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        marginBottom: 24,
      }}
    >
      <div style={{ flex: "1 1 480px", minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 12,
            color: "#867b77",
            marginBottom: 6,
          }}
        >
          {meta || t.eyebrow}
        </div>
        <h1
          style={{
            fontSize: 30,
            lineHeight: 1.15,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#6e0431",
            margin: 0,
          }}
        >
          {headline}
        </h1>
        {lede && (
          <p
            style={{
              marginTop: 10,
              maxWidth: "75ch",
              fontSize: 16,
              color: "#3d3d3d",
              lineHeight: 1.5,
            }}
          >
            {lede}
          </p>
        )}
      </div>
      <div
        style={{
          display: "flex",
          border: "1px solid #d9d2cf",
          borderRadius: 6,
          overflow: "hidden",
          background: "#fff",
          flexShrink: 0,
        }}
        role="group"
        aria-label={t.modeLabel}
      >
        <button
          type="button"
          aria-pressed={mode === "datos"}
          onClick={() => onModeChange("datos")}
          style={{
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            border: 0,
            background: mode === "datos" ? "#f3e8ee" : "transparent",
            color: mode === "datos" ? "#6e0431" : "#8f0f48",
            padding: "8px 14px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t.data}
        </button>
        <button
          type="button"
          aria-pressed={mode === "narrativa"}
          onClick={() => onModeChange("narrativa")}
          style={{
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            border: 0,
            borderLeft: "1px solid #d9d2cf",
            background: mode === "narrativa" ? "#f3e8ee" : "transparent",
            color: mode === "narrativa" ? "#6e0431" : "#8f0f48",
            padding: "8px 14px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t.narrative}
        </button>
      </div>
    </div>
  );
}