import { useState, useEffect, useRef } from "react";
import type { CompanionQuestion } from "../page";

interface QuestionStageProps {
  lang: "en" | "es";
  questions: CompanionQuestion[];
  profileSummary: string;
  onChoose: (q: CompanionQuestion, voiceId: string) => void;
}

// Fallback questions used when DB has no real ones yet
const FALLBACK_QUESTIONS: Record<"en" | "es", CompanionQuestion[]> = {
  en: [
    {
      number: 1,
      question_text: "When something really matters, you name what's wrong — then you soften it before it fully lands. What would happen if you let one critique finish?",
      summary: "What if you let one critique land all the way?",
      vars: [
        ["Organizational · Serviazgo", "Hard truths, delivered with care, build trust."],
        ["Professional · Decision quality", "Problems surface once and get solved once."],
        ["Personal · Being heard", "Your point lands the first time."],
      ],
    },
    {
      number: 2,
      question_text: "Think of the last decision you regretted. Every decision is weighed from a frame — logic, or people. Which frame were you in when you made that one?",
      summary: "Which frame were you in for your last regretted decision?",
      vars: [
        ["Organizational · Serviazgo", "Decisions owned fully serve the people they touch."],
        ["Professional · Decision quality", "Fewer calls relitigated after the fact."],
        ["Personal · Confidence", "You stand behind the decision you made."],
      ],
    },
    {
      number: 3,
      question_text: "You read meaning into change fast — and act on it. Your theory moves before the facts arrive. When did you last test your read against what was actually happening?",
      summary: "When did you last test your read against the facts?",
      vars: [
        ["Organizational · Serviazgo", "Reads grounded in your people's reality."],
        ["Professional · Execution", "Acting on what is — not the theory of it."],
        ["Personal · Trusted instinct", "Your speed, verified, moves even faster."],
      ],
    },
  ],
  es: [
    {
      number: 1,
      question_text: "Cuando algo realmente importa, señalas lo que está mal — y luego lo suavizas antes de que aterrice por completo. ¿Qué pasaría si dejaras que una crítica llegara hasta el final?",
      summary: "¿Qué pasaría si dejaras que una crítica aterrizara por completo?",
      vars: [
        ["Organizacional · Serviazgo", "Las verdades difíciles, dichas con cuidado, construyen confianza."],
        ["Profesional · Calidad de decisión", "Los problemas salen una vez y se resuelven una vez."],
        ["Personal · Ser escuchado", "Tu punto aterriza a la primera."],
      ],
    },
    {
      number: 2,
      question_text: "Piensa en la última decisión de la que te arrepentiste. Toda decisión se pesa desde un marco — la lógica, o las personas. ¿En qué marco estabas cuando tomaste esa?",
      summary: "¿Desde qué marco tomaste tu última decisión de la que te arrepientes?",
      vars: [
        ["Organizacional · Serviazgo", "Las decisiones asumidas por completo sirven a la gente que tocan."],
        ["Profesional · Calidad de decisión", "Menos decisiones que se vuelven a litigar."],
        ["Personal · Confianza", "Sostienes la decisión que tomaste."],
      ],
    },
    {
      number: 3,
      question_text: "Lees rápido el significado de un cambio — y actúas. Tu teoría avanza antes de que lleguen los hechos. ¿Cuándo pusiste a prueba tu lectura contra lo que realmente pasaba?",
      summary: "¿Cuándo pusiste a prueba tu lectura contra los hechos reales?",
      vars: [
        ["Organizacional · Serviazgo", "Lecturas ancladas en la realidad de tu gente."],
        ["Profesional · Ejecución", "Actuar sobre lo que es — no sobre la teoría."],
        ["Personal · Instinto confiable", "Tu velocidad, verificada, avanza aún más rápido."],
      ],
    },
  ],
};

const copy = {
  en: {
    eyebrow: "Your starting question",
    sub: "Your companion guide surfaced three questions from your profile. One will open the conversation. Choose the one that speaks to you most — or start with the one we recommended. Take a moment to reflect on which question feels most challenging to you.",
    recommended: "Recommended",
    vars_title: "What this unlocks",
    vars_items: [
      { label: "Organizational progress", color: "#b8532a", bg: "#fef3ec", icon: "ri-building-4-line" },
      { label: "Professional progress", color: "#1e6b52", bg: "#ecf8f2", icon: "ri-briefcase-line" },
      { label: "Personal progress", color: "#8f0f48", bg: "#fdf0f5", icon: "ri-user-heart-line" },
    ],
    start: "Start here →",
    option_label: "Option",
    of: "of",
    prev: "Previous",
    next: "Next",
    voice_title: "Choose your guide's voice",
    voice_subtitle: "The voice you select will read all AI coach interactions during your conversation.",
    test_voice: "Test voice",
    testing: "Playing…",
  },
  es: {
    eyebrow: "Tu pregunta inicial",
    sub: "Tu companion guide encontró tres preguntas en tu perfil. Una abrirá la conversación. Elige la que más resuena contigo — o empieza con la que recomendamos. Tómate un momento para reflexionar sobre qué pregunta te parece más retadora.",
    recommended: "Recomendada",
    vars_title: "Lo que esto desbloquea",
    vars_items: [
      { label: "Progreso organizacional", color: "#b8532a", bg: "#fef3ec", icon: "ri-building-4-line" },
      { label: "Progreso profesional", color: "#1e6b52", bg: "#ecf8f2", icon: "ri-briefcase-line" },
      { label: "Progreso personal", color: "#8f0f48", bg: "#fdf0f5", icon: "ri-user-heart-line" },
    ],
    start: "Empezar aquí →",
    option_label: "Opción",
    of: "de",
    prev: "Anterior",
    next: "Siguiente",
    voice_title: "Elige la voz de tu guía",
    voice_subtitle: "La voz que selecciones leerá todas las interacciones del coach de IA durante tu conversación.",
    test_voice: "Probar voz",
    testing: "Reproduciendo…",
  },
};

const VOICES = [
  { id: "1fz2mW1imKTf5Ryjk5su", name: "Kevin", color: "#b8532a" },
  { id: "kdmDKE6EkgrWrrykO9Qt", name: "Alexandra", color: "#8f0f48" },
  { id: "zSiMZcCo0oBh047sunsX", name: "Andrew", color: "#1e6b52" },
  { id: "l4Coq6695JDX9xtLqXDE", name: "Lauren", color: "#9b7b4c" },
];

const ELEVENLABS_API_KEY = "sk_862035862ac3086282afeed249e5bcacd281ebf966a2e029";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use real questions if available (must come from webhook), otherwise fallback
  const hasRealQuestions = questions && questions.length >= 1 && questions[0].question_text;
  const qs: CompanionQuestion[] = hasRealQuestions
    ? questions.slice(0, Math.min(questions.length, 3)).map((q) => ({ ...q }))
    : FALLBACK_QUESTIONS[lang];

  const total = qs.length;
  const current = qs[chosen];

  const goPrev = () => { if (chosen > 0) setChosen(chosen - 1); };
  const goNext = () => { if (chosen < total - 1) setChosen(chosen + 1); };

  // Single paragraph fade-in when question changes
  useEffect(() => {
    setQuestionVisible(false);
    const timer = setTimeout(() => setQuestionVisible(true), 120);
    return () => clearTimeout(timer);
  }, [chosen]);

  // Cleanup test audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ── Test voice via ElevenLabs ───────────────────────────────────────────
  const handleTestVoice = async (voiceId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setTestVoiceId(voiceId);
    try {
      const phrase = TEST_PHRASES[lang];
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: phrase,
            model_id: "eleven_flash_v2_5",
            output_format: "mp3_44100_128",
          }),
        },
      );
      if (!res.ok) {
        setTestVoiceId(null);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setTestVoiceId(null);
        audioRef.current = null;
      };
    } catch {
      setTestVoiceId(null);
    }
  };

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

          {/* Carousel + Start button (single column) */}
          <div>
            {/* Option indicator & arrows row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <button
                onClick={goPrev}
                disabled={chosen === 0}
                aria-label={t.prev}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  border: "1px solid #d9d2cf",
                  background: chosen === 0 ? "#f5f2f0" : "#fff",
                  cursor: chosen === 0 ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: chosen === 0 ? 0.35 : 1,
                  transition: "0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (chosen > 0) { e.currentTarget.style.background = "#f3e8ee"; e.currentTarget.style.borderColor = "#b1005d"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = chosen === 0 ? "#f5f2f0" : "#fff"; e.currentTarget.style.borderColor = "#d9d2cf"; }}
              >
                <i className="ri-arrow-left-s-line" style={{ fontSize: 16, color: chosen === 0 ? "#c4bab5" : "#3d3d3d" }}></i>
              </button>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8f0f48",
                  whiteSpace: "nowrap",
                }}
              >
                {t.option_label} {chosen + 1} {t.of} {total}
              </span>

              <button
                onClick={goNext}
                disabled={chosen === total - 1}
                aria-label={t.next}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  border: "1px solid #d9d2cf",
                  background: chosen === total - 1 ? "#f5f2f0" : "#fff",
                  cursor: chosen === total - 1 ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: chosen === total - 1 ? 0.35 : 1,
                  transition: "0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (chosen < total - 1) { e.currentTarget.style.background = "#f3e8ee"; e.currentTarget.style.borderColor = "#b1005d"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = chosen === total - 1 ? "#f5f2f0" : "#fff"; e.currentTarget.style.borderColor = "#d9d2cf"; }}
              >
                <i className="ri-arrow-right-s-line" style={{ fontSize: 16, color: chosen === total - 1 ? "#c4bab5" : "#3d3d3d" }}></i>
              </button>

              {/* Dot indicators */}
              <div style={{ display: "flex", gap: 5, marginLeft: 2 }}>
                {qs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setChosen(i)}
                    aria-label={`${t.option_label} ${i + 1}`}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
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

            {/* Question card */}
            <div
              key={chosen}
              style={{
                borderRadius: 11,
                padding: "16px 20px",
                marginBottom: 10,
                borderLeft: "4px solid #8f0f48",
                background: "#faf7f8",
                opacity: questionVisible ? 1 : 0,
                transform: questionVisible ? "none" : "translateY(8px)",
                transition: "opacity 0.45s ease, transform 0.45s ease",
              }}
            >
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.55,
                  fontWeight: 400,
                  color: "#3d3d3d",
                  margin: 0,
                }}
              >
                {current.question_text}
              </p>
            </div>

            {/* Start button */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
              <button
                onClick={() => onChoose(current, selectedVoiceId)}
                style={{
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  border: "none",
                  borderRadius: 11,
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

          {/* Voice Selection Section */}
          <div
            style={{
              borderTop: "1px solid #ece5e1",
              paddingTop: 22,
              marginTop: 18,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#867b77",
                marginBottom: 6,
              }}
            >
              {t.voice_title}
            </p>
            <p style={{ fontSize: 13, color: "#867b77", lineHeight: 1.5, marginBottom: 16 }}>
              {t.voice_subtitle}
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

          {/* Full-width "What this unlocks" section */}
          <div
            style={{
              borderTop: "1px solid #ece5e1",
              paddingTop: 22,
              marginTop: 18,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#867b77",
                marginBottom: 14,
              }}
            >
              {t.vars_title}
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {t.vars_items.map((item, idx) => (
                <div
                  key={item.label}
                  className="unlock-card"
                  style={{
                    flex: 1,
                    minWidth: 160,
                    background: "#fff",
                    border: "1px solid #ece5e1",
                    borderTop: `3px solid ${item.color}`,
                    borderRadius: 14,
                    padding: "22px 16px 18px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Pulsing ring behind icon */}
                  <div
                    className="pulse-ring"
                    style={{
                      position: "absolute",
                      top: 22,
                      left: "50%",
                      width: 48,
                      height: 48,
                      marginLeft: -24,
                      borderRadius: 999,
                      border: `2px solid ${item.color}`,
                      opacity: 0.35,
                      pointerEvents: "none",
                      animationDelay: `${idx * 0.9}s`,
                    }}
                  />

                  {/* Icon circle */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 999,
                      background: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: 22, color: "#fff" }}></i>
                  </div>

                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: item.color,
                      lineHeight: 1.35,
                      display: "block",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          60%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1);   opacity: 0.4; }
        }
        .pulse-ring {
          animation: pulse-ring 2.8s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 520px) {
          .unlock-card { min-width: 100% !important; flex: none !important; }
        }
      `}</style>
    </div>
  );
}