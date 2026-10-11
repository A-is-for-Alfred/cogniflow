import type { RoadmapData } from "./roadmapTypes";

interface RoadmapSevenDaysProps {
  data: RoadmapData;
  lang: "en" | "es";
}

export default function RoadmapSevenDays({ data, lang }: RoadmapSevenDaysProps) {
  const days = data.next_7_days;
  if (!days || days.length === 0) return null;

  const t = {
    en: {
      title: "First 7 days",
      day: "Day",
      weekday: "Weekday",
      focus: "Focus",
      task: "Task",
      duration: "Duration",
      channel: "Channel",
    },
    es: {
      title: "Primeros 7 días",
      day: "Día",
      weekday: "Día semana",
      focus: "Objetivo",
      task: "Tarea",
      duration: "Duración",
      channel: "Canal",
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
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #d9d2cf",
            borderRadius: 4,
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
                {[t.day, t.weekday, t.focus, t.task, t.duration, t.channel].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        fontWeight: 700,
                        fontSize: 11.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        textAlign: "left",
                        padding: "9px 12px",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 1 ? "#faf7f8" : "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      fontFamily: "'Roboto Mono', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.day ?? i + 1}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                    }}
                  >
                    {d.weekday ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                  >
                    {d.focus_objective ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                    }}
                  >
                    {d.task ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                      fontFamily: "'Roboto Mono', monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.duration_min != null ? `${d.duration_min} min` : "—"}
                  </td>
                  <td
                    style={{
                      padding: "9px 12px",
                      borderBottom: "1px solid #d9d2cf",
                    }}
                  >
                    {d.channel ?? "—"}
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