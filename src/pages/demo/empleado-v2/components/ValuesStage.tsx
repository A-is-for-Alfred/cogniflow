import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface ValuesStageProps {
  lang: "en" | "es";
  userId: string;
  employeeId: number;
  valoresWebhookUrl?: string;
  onComplete: (valoresPayload: Record<string, unknown>) => void;
}

const KEEP_PER_BATCH = 4;
const TOP5_COUNT = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const VALUES_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  "Ambición": { en: "Ambition", es: "Ambición" },
  "Reto": { en: "Challenge", es: "Reto" },
  "Competencia": { en: "Competition", es: "Competencia" },
  "Desarrollo personal": { en: "Personal growth", es: "Desarrollo personal" },
  "Innovación": { en: "Innovation", es: "Innovación" },
  "Creatividad": { en: "Creativity", es: "Creatividad" },
  "Pasión": { en: "Passion", es: "Pasión" },
  "Libertad": { en: "Freedom", es: "Libertad" },
  "Independencia": { en: "Independence", es: "Independencia" },
  "Variedad": { en: "Variety", es: "Variedad" },
  "Aventura": { en: "Adventure", es: "Aventura" },
  "Reconocimiento": { en: "Recognition", es: "Reconocimiento" },
  "Seguridad económica": { en: "Financial security", es: "Seguridad económica" },
  "Autenticidad": { en: "Authenticity", es: "Autenticidad" },
  "Integridad": { en: "Integrity", es: "Integridad" },
  "Honestidad": { en: "Honesty", es: "Honestidad" },
  "Humildad": { en: "Humility", es: "Humildad" },
  "Auto respeto": { en: "Self-respect", es: "Auto respeto" },
  "Disciplina": { en: "Discipline", es: "Disciplina" },
  "Responsabilidad": { en: "Responsibility", es: "Responsabilidad" },
  "Compromiso": { en: "Commitment", es: "Compromiso" },
  "Sabiduría": { en: "Wisdom", es: "Sabiduría" },
  "Familia": { en: "Family", es: "Familia" },
  "Servicio": { en: "Service", es: "Servicio" },
  "Colaboración": { en: "Collaboration", es: "Colaboración" },
  "Lealtad": { en: "Loyalty", es: "Lealtad" },
  "Espiritualidad": { en: "Spirituality", es: "Espiritualidad" },
  "Armonía": { en: "Harmony", es: "Armonía" },
  "Justicia": { en: "Justice", es: "Justicia" },
  "Bienestar físico": { en: "Physical well-being", es: "Bienestar físico" },
};

function translateValue(val: string, lang: "en" | "es"): string {
  return VALUES_TRANSLATIONS[val]?.[lang] ?? val;
}

const VALUE_GROUPS = [
  {
    key: "drive" as const,
    eyebrow: { en: "What drives you", es: "Lo que te impulsa" },
    question: {
      en: "What drives you at work?",
      es: "¿Qué te impulsa en tu trabajo?",
    },
    sub: {
      en: "Keep the ones that move you. Let go of the rest — letting go also speaks.",
      es: "Conserva los que te muevan. Deja ir el resto — soltar también dice mucho.",
    },
    values: [
      "Ambición", "Reto", "Competencia", "Desarrollo personal",
      "Innovación", "Creatividad", "Pasión", "Libertad",
      "Independencia", "Variedad", "Aventura", "Reconocimiento",
      "Seguridad económica",
    ],
  },
  {
    key: "character" as const,
    eyebrow: { en: "Your name", es: "Tu nombre" },
    question: {
      en: "What comes to mind when someone hears your name?",
      es: "¿Qué viene a la mente cuando alguien escucha tu nombre?",
    },
    sub: {
      en: "Keep the values people associate with you.",
      es: "Conserva los valores con los que la gente te asocia.",
    },
    values: [
      "Autenticidad", "Integridad", "Honestidad", "Humildad",
      "Auto respeto", "Disciplina", "Responsabilidad", "Compromiso",
      "Sabiduría",
    ],
  },
  {
    key: "connection" as const,
    eyebrow: { en: "What gives meaning", es: "Lo que da sentido" },
    question: {
      en: "What gives meaning to what you do?",
      es: "¿Qué le da sentido a lo que haces?",
    },
    sub: {
      en: "Keep the ones that weigh most. Let go of the rest.",
      es: "Conserva los que más pesen. Deja ir el resto.",
    },
    values: [
      "Familia", "Servicio", "Colaboración", "Lealtad",
      "Espiritualidad", "Armonía", "Justicia", "Bienestar físico",
    ],
  },
];

const copy = {
  en: {
    of: "of",
    per_group: "Up to {n} per group",
    total_so_far: "total so far",
    next: "Next",
    continue: "Continue",
    saving: "Saving your values…",
    sending: "Sending…",
    error: "Could not save. Please try again.",
    countLabel: "Up to <b>{n}</b> per group · <b>{sofar}</b> total so far",
    introDescription: "As a first step, we'd like to help you identify the values that define you. Values are the foundation for creating our own goals. In the following 3 sections you'll be able to select up to 12 values, to arrive at a final list of the 5 most important to you.",
    // Ranking phase
    rankingTitle: "Your Top 5",
    rankingSub: "Click the values in order — from most important to least. Pick exactly 5.",
    rankingEmpty: "Click a value below to start building your top 5",
    rankingDone: "These are your top 5. Click any to remove it and pick again.",
    rankingSlot: "Slot {n}",
    rankingValues: "All your values",
    rankingPlaceholder: "—",
    rankingLessThan5: "You selected fewer than 5 values. We'll use all of them.",
  },
  es: {
    of: "de",
    per_group: "Hasta {n} por grupo",
    total_so_far: "en total",
    next: "Siguiente",
    continue: "Continuar",
    saving: "Guardando tus valores…",
    sending: "Enviando…",
    error: "No se pudieron guardar. Intenta de nuevo.",
    countLabel: "Hasta <b>{n}</b> por grupo · llevas <b>{sofar}</b> en total",
    introDescription: "Como primer paso, nos gustaría ayudarte a identificar los valores que te definen. Los valores son la base para crear nuestras propias metas. En las siguientes 3 secciones vas a poder seleccionar hasta 12 valores, para llegar a una lista final con los 5 más importantes para tí.",
    // Ranking phase
    rankingTitle: "Tu Top 5",
    rankingSub: "Haz clic en los valores en orden — del más importante al menos. Elige exactamente 5.",
    rankingEmpty: "Haz clic en un valor para empezar a armar tu top 5",
    rankingDone: "Este es tu top 5. Haz clic en cualquiera para quitarlo y elegir de nuevo.",
    rankingSlot: "Puesto {n}",
    rankingValues: "Tus valores",
    rankingPlaceholder: "—",
    rankingLessThan5: "Seleccionaste menos de 5 valores. Usaremos todos los que elegiste.",
  },
};

type BatchKey = "drive" | "character" | "connection";

export default function ValuesStage({ lang, userId, employeeId, valoresWebhookUrl, onComplete }: ValuesStageProps) {
  const t = copy[lang];
  const [batchIdx, setBatchIdx] = useState(0);
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [allSelections, setAllSelections] = useState<Record<BatchKey, string[]>>({
    drive: [],
    character: [],
    connection: [],
  });
  // "picking" = batch selection; "ranking" = pick & order top 5
  const [phase, setPhase] = useState<"picking" | "ranking">("picking");
  const [top5Order, setTop5Order] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const shuffledValues = useMemo(
    () => VALUE_GROUPS.map((g) => shuffle(g.values)),
    [],
  );

  const totalBatches = VALUE_GROUPS.length;
  const group = VALUE_GROUPS[batchIdx];
  const values = shuffledValues[batchIdx];
  const soFar = Object.values(allSelections).flat().length + picks.size;
  const atCap = picks.size >= KEEP_PER_BATCH;

  // --- Picking handlers ---
  const togglePick = useCallback(
    (val: string) => {
      setPicks((prev) => {
        const next = new Set(prev);
        if (next.has(val)) {
          next.delete(val);
        } else {
          if (next.size >= KEEP_PER_BATCH) return prev;
          next.add(val);
        }
        return next;
      });
    },
    [],
  );

  const advanceBatch = () => {
    const groupKey = group.key;
    const picked = Array.from(picks);
    const nextSelections = { ...allSelections, [groupKey]: picked };
    setAllSelections(nextSelections);

    if (batchIdx < totalBatches - 1) {
      setBatchIdx((p) => p + 1);
      setPicks(new Set());
    } else {
      // All 3 batches done — check if we have enough values for ranking
      const allVals = [
        ...nextSelections.drive,
        ...nextSelections.character,
        ...nextSelections.connection,
      ];
      if (allVals.length < TOP5_COUNT) {
        // Fewer than 5 — use all as top5 and submit immediately
        handleSubmit(nextSelections, allVals);
      } else {
        // 5 or more — go to ranking phase
        setPhase("ranking");
        setError("");
      }
    }
  };

  // --- Ranking handlers ---
  const toggleRankingPick = useCallback(
    (val: string) => {
      setTop5Order((prev) => {
        const idx = prev.indexOf(val);
        if (idx !== -1) {
          // Remove from ranking
          return prev.filter((v) => v !== val);
        }
        // Add at the end
        if (prev.length >= TOP5_COUNT) return prev;
        return [...prev, val];
      });
    },
    [],
  );

  const allCollectedValues = useMemo(
    () => [
      ...allSelections.drive,
      ...allSelections.character,
      ...allSelections.connection,
    ],
    [allSelections],
  );

  const canSubmitRanking = top5Order.length === TOP5_COUNT;

  const submitRanking = () => {
    if (!canSubmitRanking) return;
    handleSubmit(allSelections, top5Order);
  };

  // --- Save & submit ---
  const handleSubmit = async (
    selections: Record<BatchKey, string[]>,
    top5: string[],
  ) => {
    setIsSaving(true);
    setError("");

    try {
      const inserts = Object.entries(selections)
        .filter(([, vals]) => vals.length > 0)
        .map(([key, vals]) => ({
          employee_id: employeeId,
          user_id: userId,
          batch_key: key,
          valores: vals,
        }));

      // Add top5 row
      inserts.push({
        employee_id: employeeId,
        user_id: userId,
        batch_key: "top5",
        valores: top5,
      });

      if (inserts.length > 0) {
        await supabase.from("valores_seleccionados").insert(inserts);
      }

      // Build payload for ProcessingAnimation to send to the dynamic webhook
      const valoresPayload: Record<string, unknown> = {
        user_id: userId,
        employee_id: employeeId,
        valores: selections,
        top5,
        language: lang,
      };

      onComplete(valoresPayload);
    } catch {
      setError(t.error);
      setIsSaving(false);
    }
  };

  // --- Saving screen ---
  if (isSaving) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 340, flexDirection: "column", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#f3e8ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulseRing 2s infinite",
          }}
        >
          <i className="ri-heart-line" style={{ color: "#b1005d", fontSize: 22 }}></i>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#6e0431" }}>{t.saving}</p>
        <p style={{ fontSize: 12, color: "#867b77" }}>{t.sending}</p>
      </div>
    );
  }

  // ================================================================
  // RANKING PHASE
  // ================================================================
  if (phase === "ranking") {
    return (
      <div>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d9d2cf",
            borderRadius: 16,
            boxShadow: "0 1px 2px rgba(110,4,49,.05),0 8px 26px rgba(110,4,49,.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "26px 28px 30px" }}>
            {/* Progress indicator — all 3 checked */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {VALUE_GROUPS.map((g, i) => (
                <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#b1005d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i className="ri-check-line" style={{ color: "#fff", fontSize: 13 }}></i>
                  </div>
                  {i < totalBatches - 1 && (
                    <div
                      style={{
                        width: 28,
                        height: 2,
                        borderRadius: 1,
                        background: "#b1005d",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Header */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#b1005d",
                marginBottom: 6,
              }}
            >
              {t.rankingTitle}
            </p>
            <h2
              style={{
                fontSize: 20,
                lineHeight: 1.35,
                fontWeight: 700,
                color: "#6e0431",
                marginBottom: 6,
              }}
            >
              {t.rankingTitle}
            </h2>
            <p style={{ fontSize: 13, color: "#5a5050", lineHeight: 1.5, marginBottom: 24, maxWidth: 520 }}>
              {t.rankingSub}
            </p>

            {/* Top 5 slots */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 24,
                padding: "18px 20px",
                borderRadius: 12,
                background: "#fdf5f8",
                border: "1px dashed #d9a3ba",
                minHeight: top5Order.length === 0 ? 120 : "auto",
              }}
            >
              {top5Order.length === 0 ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 80,
                  color: "#b08a98",
                  fontSize: 13,
                  fontWeight: 500,
                }}>
                  {t.rankingEmpty}
                </div>
              ) : (
                <>
                  {top5Order.map((val, idx) => (
                    <div
                      key={val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#fff",
                        border: "2px solid #b1005d",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onClick={() => toggleRankingPick(val)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#8f0f48";
                        e.currentTarget.style.background = "#fff5f8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#b1005d";
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: "#b1005d",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#6e0431", flex: 1 }}>
                        {translateValue(val, lang)}
                      </span>
                      <i className="ri-close-circle-line" style={{ color: "#b1005d", fontSize: 18, flexShrink: 0 }}></i>
                    </div>
                  ))}
                  {top5Order.length === TOP5_COUNT && (
                    <p style={{ fontSize: 12, color: "#b1005d", fontWeight: 600, textAlign: "center", marginTop: 4 }}>
                      {t.rankingDone}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Value pool */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#867b77",
                marginBottom: 10,
              }}
            >
              {t.rankingValues} · {allCollectedValues.length - top5Order.length} {lang === "es" ? "disponibles" : "left"}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {allCollectedValues.map((val) => {
                const isInTop5 = top5Order.includes(val);
                const orderIdx = top5Order.indexOf(val);
                const faded = top5Order.length >= TOP5_COUNT && !isInTop5;

                return (
                  <button
                    key={val}
                    onClick={() => toggleRankingPick(val)}
                    disabled={faded}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: isInTop5 ? "2px solid #b1005d" : "1px solid #d9d2cf",
                      background: isInTop5 ? "#fdf5f8" : "#fff",
                      cursor: faded ? "default" : "pointer",
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 600,
                      color: isInTop5 ? "#6e0431" : faded ? "#c4bdb8" : "#3d3d3d",
                      opacity: faded ? 0.4 : 1,
                      transition: "all 0.18s ease",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!faded) {
                        e.currentTarget.style.borderColor = "#b1005d";
                        e.currentTarget.style.background = "#fdf5f8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isInTop5 ? "#b1005d" : "#d9d2cf";
                      e.currentTarget.style.background = isInTop5 ? "#fdf5f8" : "#fff";
                    }}
                  >
                    <span>{translateValue(val, lang)}</span>
                    {isInTop5 && (
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#b1005d",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {orderIdx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                borderTop: "1px solid #ede5ea",
                paddingTop: 16,
              }}
            >
              <p style={{ fontSize: 13, color: "#867b77", fontWeight: 600 }}>
                {top5Order.length} {t.of} {TOP5_COUNT}
              </p>

              <button
                onClick={submitRanking}
                disabled={!canSubmitRanking}
                style={{
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: canSubmitRanking ? "pointer" : "not-allowed",
                  border: "none",
                  borderRadius: 11,
                  padding: "14px 32px",
                  background: canSubmitRanking ? "#b1005d" : "#d9ccd2",
                  color: canSubmitRanking ? "#fff" : "#a8949b",
                  transition: "0.15s",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  if (canSubmitRanking) e.currentTarget.style.background = "#8f0f48";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = canSubmitRanking ? "#b1005d" : "#d9ccd2";
                }}
              >
                {t.continue}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: "#b1005d", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <i className="ri-error-warning-line"></i> {error}
              </p>
            )}
          </div>
        </div>

        <style>{`
          @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(177,0,93,0.4) } 50% { box-shadow: 0 0 0 8px rgba(177,0,93,0) } }
        `}</style>
      </div>
    );
  }

  // ================================================================
  // PICKING PHASE (batches 0-2)
  // ================================================================
  return (
    <div>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #d9d2cf",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(110,4,49,.05),0 8px 26px rgba(110,4,49,.08)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "26px 28px 30px" }}>
          {/* Progress indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            {VALUE_GROUPS.map((g, i) => (
              <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: i < batchIdx ? "#b1005d" : i === batchIdx ? "#8f0f48" : "#e8e0e4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.3s",
                    flexShrink: 0,
                  }}
                >
                  {i < batchIdx ? (
                    <i className="ri-check-line" style={{ color: "#fff", fontSize: 13 }}></i>
                  ) : (
                    <span
                      style={{
                        color: i === batchIdx ? "#fff" : "#867b77",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                {i < totalBatches - 1 && (
                  <div
                    style={{
                      width: 28,
                      height: 2,
                      borderRadius: 1,
                      background: i < batchIdx ? "#b1005d" : "#e8e0e4",
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Batch content */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#b1005d",
              marginBottom: 6,
            }}
          >
            {group.eyebrow[lang]} · {batchIdx + 1} {t.of} {totalBatches}
          </p>

          {/* Intro description — only on first batch */}
          {batchIdx === 0 && (
            <p style={{ fontSize: 14, color: "#5a5050", lineHeight: 1.7, marginBottom: 18, maxWidth: 600 }}>
              {t.introDescription}
            </p>
          )}

          <h2
            style={{
              fontSize: 20,
              lineHeight: 1.35,
              fontWeight: 700,
              color: "#6e0431",
              marginBottom: 6,
            }}
          >
            {group.question[lang]}
          </h2>
          <p style={{ fontSize: 13, color: "#5a5050", lineHeight: 1.5, marginBottom: 20, maxWidth: 520 }}>
            {group.sub[lang]}
          </p>

          {/* Value cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {values.map((val) => {
              const isPicked = picks.has(val);
              const isFaded = atCap && !isPicked;
              return (
                <button
                  key={val}
                  onClick={() => togglePick(val)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 15px",
                    borderRadius: 10,
                    border: isPicked ? "2px solid #b1005d" : "1px solid #d9d2cf",
                    background: isPicked ? "#fdf5f8" : "#fff",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 600,
                    color: isPicked ? "#6e0431" : isFaded ? "#c4bdb8" : "#3d3d3d",
                    transition: "all 0.18s ease",
                    opacity: isFaded ? 0.45 : 1,
                    whiteSpace: "nowrap",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!isFaded) {
                      e.currentTarget.style.borderColor = "#b1005d";
                      e.currentTarget.style.background = isPicked ? "#fdf5f8" : "#fdf5f8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isPicked ? "#b1005d" : "#d9d2cf";
                    e.currentTarget.style.background = isPicked ? "#fdf5f8" : "#fff";
                  }}
                >
                  <span>{translateValue(val, lang)}</span>
                  {isPicked && (
                    <i className="ri-check-line" style={{ color: "#b1005d", fontSize: 15, flexShrink: 0 }}></i>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              borderTop: "1px solid #ede5ea",
              paddingTop: 16,
            }}
          >
            <p
              style={{ fontSize: 13, color: "#867b77", fontWeight: 600 }}
              dangerouslySetInnerHTML={{
                __html: t.countLabel
                  .replace("{n}", String(KEEP_PER_BATCH))
                  .replace("{sofar}", String(soFar)),
              }}
            />

            <button
              onClick={advanceBatch}
              style={{
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                border: "none",
                borderRadius: 11,
                padding: "14px 32px",
                background: "#b1005d",
                color: "#fff",
                transition: "0.15s",
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#8f0f48"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#b1005d"; }}
            >
              {batchIdx === totalBatches - 1 ? t.next : t.next}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#b1005d", marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <i className="ri-error-warning-line"></i> {error}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(177,0,93,0.4) } 50% { box-shadow: 0 0 0 8px rgba(177,0,93,0) } }
      `}</style>
    </div>
  );
}