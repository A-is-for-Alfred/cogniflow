import { useState, useEffect } from "react";
import type { CompanionQuestion } from "../page";
import { isMuted, stopAll, play, speakTTS } from "@/pages/demo/empleado-v5/audioManager";

interface QuestionStageProps {
  lang: "en" | "es";
  questions: CompanionQuestion[];
  profileSummary: string;
  onChoose: (q: CompanionQuestion, voiceId: string) => void;
}

const copy = {
  en: {
    eyebrow: "Your coaching session",
    sub: "Your profile generated a set of questions just for you, grouped into four question sets. Each set describes different situations and asks you about them. Use the Next or Previous button to toggle between each set of questions (you don't have to answer them yet) and choose the one that contains the questions that resonate most with you, then press Save and continue to begin your experience.",
    welcome:
      "Your profile generated a set of questions just for you, grouped into four question sets. Each set describes different situations and asks you about them. Use the Next or Previous button to toggle between each set of questions (you don't have to answer them yet) and choose the one that contains the questions that resonate most with you, then press Save and continue to begin your experience.",
    scope_prefix: "SCOPE OF THIS SET",
    questions_label: "questions",
    minutes_label: "min",
    source_data: "SOURCE DATA · MBTI STEP II",
    source_report: "Source: your report, section 2",
    questions_title: "Questions",
    reader_act_label: "Choose this scenario if you've ever…",
    interpersonal_impact_label: "How it affects others",
    purpose_label: "In this session",
    start: "Save and continue →",
    option_label: "Set",
    of: "of",
    prev: "Previous",
    next: "Next",
    voice_toggle: "Change your guide's voice",
    voice_title: "Choose your guide's voice",
    voice_subtitle: "The voice you select will read all AI coach interactions during your conversation.",
    voice_on: "Voice ON",
    voice_off: "Voice OFF",
    test_voice: "Test voice",
    testing: "Playing…",
    anchor_label: "Situate",
    retrieve_label: "Retrieve",
    recall_prefix: "Recall window:",
  },
  es: {
    eyebrow: "Tu sesión de coaching",
    sub: "Tu perfil generó un conjunto de preguntas solo para ti, agrupadas en cuatro sets de preguntas. Cada set describe situaciones diferentes y te pregunta sobre ellas. Usa el botón Siguiente o Anterior para alternar entre cada set de preguntas (aún no tienes que responderlas) y elige el que contenga las preguntas que más resuenan contigo, luego presiona Guardar y continuar para comenzar tu experiencia.",
    welcome:
      "Tu perfil generó un conjunto de preguntas solo para ti, agrupadas en cuatro sets de preguntas. Cada set describe situaciones diferentes y te pregunta sobre ellas. Usa el botón Siguiente o Anterior para alternar entre cada set de preguntas (aún no tienes que responderlas) y elige el que contenga las preguntas que más resuenan contigo, luego presiona Guardar y continuar para comenzar tu experiencia.",
    scope_prefix: "ALCANCE DE ESTE SET",
    questions_label: "preguntas",
    minutes_label: "min",
    source_data: "DATO DE ORIGEN · MBTI STEP II",
    source_report: "Fuente: tu reporte, sección 2",
    questions_title: "Preguntas",
    reader_act_label: "Elige este escenario si te ha pasado que…",
    interpersonal_impact_label: "Cómo afecta a los otros",
    purpose_label: "En esta sesión",
    start: "Guardar y continuar →",
    option_label: "Set",
    of: "de",
    prev: "Anterior",
    next: "Siguiente",
    voice_toggle: "Cambiar la voz de tu guía",
    voice_title: "Elige la voz de tu guía",
    voice_subtitle: "La voz que selecciones leerá todas las interacciones del coach de IA durante tu conversación.",
    voice_on: "Voz ON",
    voice_off: "Voz OFF",
    test_voice: "Probar voz",
    testing: "Reproduciendo…",
    anchor_label: "Situar",
    retrieve_label: "Recuperar",
    recall_prefix: "Ventana de recuerdo:",
  },
};

const VOICES = [
  { id: "1fz2mW1imKTf5Ryjk5su", name: "Kevin", color: "#b8532a" },
  { id: "kdmDKE6EkgrWrrykO9Qt", name: "Alexandra", color: "#8f0f48" },
  { id: "zSiMZcCo0oBh047sunsX", name: "Andrew", color: "#1e6b52" },
  { id: "l4Coq6695JDX9xtLqXDE", name: "Lauren", color: "#9b7b4c" },
];

const TEST_PHRASES: Record<"en" | "es", string> = {
  en: "Hello, I'm your AI coach, I'm happy to meet you",
  es: "Hola, soy tu coach de IA, estoy feliz de conocerte",
};

export default function QuestionStage({ lang, questions, profileSummary, onChoose }: QuestionStageProps) {
  const t = copy[lang];
  const [chosen, setChosen] = useState(0);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICES[0].id);
  const [testVoiceId, setTestVoiceId] = useState<string | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Filter to only questions that have V3 webhook data (bullets)
  const v3Questions = questions.filter((q) => q.bullets && q.bullets.length > 0);
  // If no V3 data, fall back to legacy questions
  const hasV3Data = v3Questions.length > 0;
  const qs: CompanionQuestion[] = hasV3Data ? v3Questions : questions;

  const total = qs.length;
  const current = qs[chosen];

  const goPrev = () => { if (chosen > 0) setChosen(chosen - 1); };
  const goNext = () => { if (chosen < total - 1) setChosen(chosen + 1); };

  // Fade-in animation when item changes
  useEffect(() => {
    setQuestionVisible(false);
    const timer = setTimeout(() => setQuestionVisible(true), 120);
    return () => clearTimeout(timer);
  }, [chosen]);

  // Stop any playing audio on unmount (prevents overlapping audio across stages)
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  // Auto-read the welcome message with the default voice on mount
  useEffect(() => {
    const speakWelcome = async () => {
      const url = await speakTTS(t.welcome, VOICES[0].id);
      if (url) play(url);
    };
    speakWelcome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Test voice via ElevenLabs ───────────────────────────────────────────
  const handleTestVoice = async (voiceId: string) => {
    stopAll();
    if (isMuted()) return;
    setTestVoiceId(voiceId);
    const phrase = TEST_PHRASES[lang];
    const url = await speakTTS(phrase, voiceId);
    if (!url) {
      setTestVoiceId(null);
      return;
    }
    play(url, { onEnd: () => setTestVoiceId(null) });
  };

  // Build meta items (reader_act, interpersonal_impact, purpose) from webhook data
  const getMetaItems = () => {
    if (!current) return [];
    // The V3 webhook returns the author's action and its interpersonal impact
    // inside items[].tension.reader_act / items[].tension.interpersonal_impact.
    // Prefer those fields; only fall back to the intro sentence / pattern when
    // they are missing so we never show the wrong content.
    const readerAct = (current.tension?.reader_act || current.intro?.sentences?.reader_act || current.intro?.sentences?.position || "").trim();
    const impact = (current.tension?.interpersonal_impact || current.tension?.pattern || "").trim();
    const purpose = (current.intro?.sentences?.purpose || "").trim();
    return [
      { key: "reader_act", label: t.reader_act_label, value: readerAct, icon: "ri-user-line" },
      { key: "interpersonal_impact", label: t.interpersonal_impact_label, value: impact, icon: "ri-team-line" },
      { key: "purpose", label: t.purpose_label, value: purpose, icon: "ri-focus-3-line" },
    ].filter((item) => item.value.length > 0);
  };

  // Build source data text from intro facets_cited + tension facets
  const getSourceDataText = () => {
    if (!current.intro && !current.tension) return profileSummary || "";

    const parts: string[] = [];

    // From tension facets
    if (current.tension?.facets && current.tension.facets.length > 0) {
      current.tension.facets.forEach((facet) => {
        const prefLabel = facet.preference === "out-of-preference" ? " (out-of-preference)" : "";
        parts.push(`${facet.name}${prefLabel}: ${facet.score}. `);
      });
    }

    // From intro facets_cited
    if (current.intro?.facets_cited && current.intro.facets_cited.length > 0) {
      current.intro.facets_cited.forEach((fc) => {
        if (parts.some((p) => p.includes(fc.name))) return; // skip duplicates
        const scoreText = fc.score !== undefined ? `: ${fc.score}` : "";
        parts.push(`${fc.name}${scoreText}. `);
      });
    }

    // If no facets info, use tension pattern or intro position
    if (parts.length === 0) {
      if (current.tension?.pattern) {
        parts.push(current.tension.pattern);
      } else if (current.intro?.sentences?.position) {
        parts.push(current.intro.sentences.position);
      }
    }

    return parts.join("");
  };

  // Session header title
  const getSessionTitle = () => {
    if (current.tension?.name) return current.tension.name;
    return `${t.option_label} ${current.number}`;
  };

  // Scope text
  const getScopeText = () => {
    if (current.intro?.scope?.raw) return current.intro.scope.raw;
    const bulletCount = current.counts?.bullets || current.bullets?.length || 0;
    const minutes = current.intro?.scope?.minutes || Math.ceil(bulletCount * 1.5);
    return `${bulletCount} ${t.questions_label} · ~${minutes} ${t.minutes_label}`;
  };

  const isV3Item = hasV3Data && current.bullets && current.bullets.length > 0;
  const metaItems = getMetaItems();

  return (
    <div>
      {/* ── Voice Selection Section ─────────────────────────────────────── */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #d9d2cf",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(110,4,49,.05),0 8px 26px rgba(110,4,49,.08)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setVoiceOpen(!voiceOpen)}
          aria-expanded={voiceOpen}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "transparent",
            border: "none",
            padding: "20px 28px",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#faf7f8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                background: "#f3e8ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="ri-user-voice-line" style={{ fontSize: 18, color: "#8f0f48" }}></i>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#3d3d3d", margin: 0 }}>
                {t.voice_toggle}
              </p>
              <p style={{ fontSize: 12, color: "#867b77", margin: 0, marginTop: 2 }}>
                {t.voice_subtitle}
              </p>
            </div>
          </div>
          <i
            className={voiceOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}
            style={{ fontSize: 20, color: "#867b77", flexShrink: 0, transition: "transform 0.2s ease" }}
          ></i>
        </button>

        {voiceOpen && (
          <div style={{ padding: "0 28px 22px", borderTop: "1px solid #ece5e1" }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#867b77",
                margin: "18px 0 6px",
              }}
            >
              {t.voice_title}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {VOICES.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;
            const isPlaying = testVoiceId === voice.id;
            return (
              <div
                key={voice.id}
                style={{
                  flex: 1,
                  minWidth: 150,
                  background: "#fff",
                  border: `2px solid ${isSelected ? voice.color : "#ece5e1"}`,
                  borderRadius: 14,
                  padding: "16px 14px 14px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                  position: "relative",
                }}
                onClick={() => setSelectedVoiceId(voice.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(110,4,49,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: voice.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className="ri-check-line" style={{ fontSize: 10, color: "#fff" }}></i>
                  </div>
                )}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background: isSelected ? voice.color : `${voice.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    transition: "background 0.25s ease",
                  }}
                >
                  <i
                    className="ri-user-voice-line"
                    style={{ fontSize: 22, color: isSelected ? "#fff" : voice.color }}
                  ></i>
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#3d3d3d",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  {voice.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(voice.id);
                  }}
                  disabled={isPlaying}
                  style={{
                    fontFamily: "inherit",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: isPlaying ? "default" : "pointer",
                    border: "none",
                    borderRadius: 999,
                    padding: "7px 16px",
                    background: isPlaying ? `${voice.color}14` : voice.color,
                    color: isPlaying ? voice.color : "#fff",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    margin: "0 auto",
                    transition: "0.15s",
                  }}
                >
                  <i
                    className={isPlaying ? "ri-loader-4-line" : "ri-volume-up-line"}
                    style={{
                      fontSize: 13,
                      animation: isPlaying ? "spin 1s linear infinite" : "none",
                    }}
                  ></i>
                  {isPlaying ? t.testing : t.test_voice}
                </button>
              </div>
            );
          })}
            </div>
          </div>
        )}
      </div>

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
            {t.eyebrow}
          </p>
          <p style={{ fontSize: 15, color: "#867b77", lineHeight: 1.65, marginBottom: 26 }}>
            {t.sub}
          </p>

          {/* Navigation + dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              background: "#faf7f8",
              border: "1px solid #ece5e1",
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={goPrev}
              disabled={chosen === 0}
              aria-label={t.prev}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 40,
                padding: "0 16px",
                borderRadius: 999,
                border: "1px solid #d9d2cf",
                background: chosen === 0 ? "#f5f2f0" : "#ffffff",
                cursor: chosen === 0 ? "default" : "pointer",
                opacity: chosen === 0 ? 0.45 : 1,
                transition: "0.15s",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
                color: chosen === 0 ? "#c4bab5" : "#3d3d3d",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (chosen > 0) { e.currentTarget.style.background = "#f3e8ee"; e.currentTarget.style.borderColor = "#b1005d"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = chosen === 0 ? "#f5f2f0" : "#fff"; e.currentTarget.style.borderColor = "#d9d2cf"; }}
            >
              <i className="ri-arrow-left-s-line" style={{ fontSize: 18 }}></i>
              {t.prev}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.02em", color: "#8f0f48", whiteSpace: "nowrap" }}>
                {t.option_label} {chosen + 1} {t.of} {total}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {qs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setChosen(i)}
                    aria-label={`${t.option_label} ${i + 1}`}
                    style={{
                      width: 10, height: 10, borderRadius: 999,
                      border: "none",
                      background: i === chosen ? "#8f0f48" : "#d9d2cf",
                      cursor: "pointer",
                      transition: "0.2s",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={goNext}
              disabled={chosen === total - 1}
              aria-label={t.next}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 40,
                padding: "0 18px",
                borderRadius: 999,
                border: "1px solid transparent",
                background: chosen === total - 1 ? "#f5f2f0" : "#b1005d",
                cursor: chosen === total - 1 ? "default" : "pointer",
                opacity: chosen === total - 1 ? 0.45 : 1,
                transition: "0.15s",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
                color: chosen === total - 1 ? "#c4bab5" : "#ffffff",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (chosen < total - 1) { e.currentTarget.style.background = "#8f0f48"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = chosen === total - 1 ? "#f5f2f0" : "#b1005d"; }}
            >
              {t.next}
              <i className="ri-arrow-right-s-line" style={{ fontSize: 18 }}></i>
            </button>
          </div>

          {/* ── Session Card ─────────────────────────────────────────────── */}
          <div
            key={chosen}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #d9d2cf",
              background: "#fff",
              opacity: questionVisible ? 1 : 0,
              transform: questionVisible ? "none" : "translateY(8px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
            }}
          >
            {/* Session header bar */}
            <div
              style={{
                background: "#6e0431",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                {getSessionTitle()}
              </span>
              <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: 600 }}>
                {t.option_label} {current.number} {t.of} {total}
              </span>
            </div>

            <div style={{ padding: "20px 22px" }}>
              {/* Scope row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #ece5e1" }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b1005d" }}>
                  {t.scope_prefix}
                </span>
                <span style={{ fontSize: 13, color: "#867b77", fontWeight: 500 }}>
                  {getScopeText()}
                </span>
              </div>

              {/* Meta: reader_act, interpersonal_impact, purpose */}
              {metaItems.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {metaItems.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        background: "#f8f4f6",
                        borderRadius: 10,
                        padding: "14px 16px",
                        border: "1px solid #ede5ea",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            background: "#b1005d",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i className={item.icon} style={{ fontSize: 12, color: "#fff" }}></i>
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#b1005d" }}>
                          {item.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3d3d3d", margin: 0 }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Source Data box (V3 style) */}
              {isV3Item ? (
                <div
                  style={{
                    background: "#f8f4f6",
                    borderRadius: 10,
                    padding: "16px 18px",
                    marginBottom: 20,
                    border: "1px solid #ede5ea",
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#b1005d", marginBottom: 8 }}>
                    {t.source_data}
                  </p>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3d3d3d", margin: 0 }}>
                    {getSourceDataText()}
                  </p>
                  <p style={{ fontSize: 11, color: "#867b77", marginTop: 10, fontStyle: "italic" }}>
                    {t.source_report}
                  </p>
                </div>
              ) : (
                /* Legacy question card */
                <div
                  style={{
                    borderRadius: 11,
                    padding: "16px 20px",
                    marginBottom: 16,
                    borderLeft: "4px solid #8f0f48",
                    background: "#faf7f8",
                  }}
                >
                  <p style={{ fontSize: 17, lineHeight: 1.55, fontWeight: 400, color: "#3d3d3d", margin: 0 }}>
                    {current.question_text}
                  </p>
                </div>
              )}

              {/* Action button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, flexWrap: "wrap", marginTop: 24, paddingTop: 16, borderTop: "1px solid #ece5e1" }}>
                <p style={{ fontSize: 12, color: "#867b77", marginRight: "auto", maxWidth: 340, lineHeight: 1.45 }}>
                  {lang === "es"
                    ? "Tus respuestas alimentan el documento de ruta de desarrollo al cerrar la sesión."
                    : "Your answers feed the development-route document at session close."}
                </p>
                <button
                  onClick={() => onChoose(current, selectedVoiceId)}
                  style={{
                    fontFamily: "inherit",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 28px",
                    background: "#b1005d",
                    color: "#fff",
                    transition: "0.15s",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#8f0f48"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#b1005d"; }}
                >
                  {t.start}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}