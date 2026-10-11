import type { RoadmapData } from "./roadmapTypes";

interface RoadmapProfileProps {
  data: RoadmapData;
  lang: "en" | "es";
}

export default function RoadmapProfile({ data, lang }: RoadmapProfileProps) {
  const profile = data.reader_profile;
  if (!profile) return null;

  const t = {
    en: {
      title: "Profile that defines the terrain",
      facets: "Facets",
      tensions: "Structural tensions",
      values: "Core values",
    },
    es: {
      title: "Perfil que define el terreno",
      facets: "Facetas",
      tensions: "Tensiones estructurales",
      values: "Valores centrales",
    },
  }[lang];

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
        <span
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 13,
            color: "#867b77",
          }}
        >
          {profile.mbti_base} · {profile.display_name}
        </span>
      </div>
      <div style={{ padding: "14px 20px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {(profile.key_facets || []).map((f, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                border: "1px solid #d9d2cf",
                borderRadius: 4,
                padding: "5px 9px",
                background: "#faf7f8",
                fontSize: 13,
              }}
            >
              <b
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontWeight: 700,
                  color: "#6e0431",
                }}
              >
                {f.facet}
              </b>
              <span
                style={{
                  fontSize: 11,
                  color: "#867b77",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {f.pole} {f.score}
              </span>
            </span>
          ))}
        </div>

        {profile.tension_patterns && profile.tension_patterns.length > 0 && (
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
              {t.tensions}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {profile.tension_patterns.map((tp, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    border: "1px dashed #d9d2cf",
                    borderRadius: 4,
                    padding: "5px 9px",
                    background: "#faf7f8",
                    fontSize: 13,
                  }}
                >
                  {tp}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.core_values && profile.core_values.length > 0 && (
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
              {t.values}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {profile.core_values.map((cv, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    border: "1px solid #d9d2cf",
                    borderRadius: 4,
                    padding: "5px 9px",
                    background: "#faf7f8",
                    fontSize: 13,
                  }}
                >
                  {cv}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}