interface RoadmapTopBarProps {
  lang: "en" | "es";
  topMeta?: string;
}

export default function RoadmapTopBar({ lang, topMeta }: RoadmapTopBarProps) {
  const t = {
    en: { brand: "Cogniflow", sub: "Leader's Roadmap" },
    es: { brand: "Cogniflow", sub: "Roadmap del líder" },
  }[lang];

  return (
    <div style={{ background: "#6e0431", color: "#fff" }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "13px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.01em" }}>
          {t.brand}{" "}
          <span style={{ fontWeight: 400, color: "#f3e8ee" }}>· {t.sub}</span>
        </div>
        {topMeta && (
          <div style={{ fontSize: 13, color: "#f3e8ee" }}>{topMeta}</div>
        )}
      </div>
    </div>
  );
}