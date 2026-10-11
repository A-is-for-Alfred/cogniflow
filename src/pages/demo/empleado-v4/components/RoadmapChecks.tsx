import type { RoadmapData } from "./roadmapTypes";

interface RoadmapChecksProps {
  data: RoadmapData;
  lang: "en" | "es";
}

export default function RoadmapChecks({ data, lang }: RoadmapChecksProps) {
  const checks = data.integrity_check;
  if (!checks || checks.length === 0) return null;

  const t = {
    en: {
      title: "Node verification",
      pass: "✓",
      warn: "⚠",
      fail: "✗",
    },
    es: {
      title: "Verificación del nodo",
      pass: "✓",
      warn: "⚠",
      fail: "✗",
    },
  }[lang];

  const statusColor = (s?: string) => {
    if (s === "warn") return "#f5802c";
    if (s === "fail") return "#dc2626";
    return "#b1005d";
  };

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
        style={{ padding: "18px 20px 0" }}
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
      </div>
      <div style={{ padding: "14px 20px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {checks.map((c, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                border: "1px solid #d9d2cf",
                borderRadius: 4,
                padding: "6px 10px",
                background: "#faf7f8",
                overflowWrap: "anywhere",
              }}
            >
              <span
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontWeight: 700,
                  color: statusColor(c.status),
                }}
              >
                {t[c.status ?? "pass" as "pass" | "warn" | "fail"]}
              </span>
              {c.check}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}