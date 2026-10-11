import { useState } from "react";
import { supabase } from "@/lib/cogniflow";

interface SurveyQuestion {
  id: number;
  text: string;
  labelLow: string;
  labelHigh: string;
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: 1,
    text: "¿En qué medida se sintió motivado/a a seguir respondiendo de manera voluntaria desde el inicio de la sesión?",
    labelLow: "Nada motivado, seguí por obligación",
    labelHigh: "Completamente enganchado desde el principio",
  },
  {
    id: 2,
    text: "¿Qué tan creíbles y valiosas le parecieron las primeras preguntas de la sesión?",
    labelLow: "Nada creíbles, casi detengo la interacción",
    labelHigh: "Muy valiosas, me engancharon de inmediato",
  },
  {
    id: 3,
    text: "¿Cómo calificaría el tono y estilo de las preguntas planteadas por el Companion?",
    labelLow: "Genéricas y artificiales",
    labelHigh: "Nivel experto, como un coach experimentado",
  },
  {
    id: 4,
    text: "¿Qué tan personalizadas y relevantes sintió las preguntas para su situación individual?",
    labelLow: "Muy genéricas, aplicables a cualquiera",
    labelHigh: "Claramente personalizadas y relevantes",
  },
  {
    id: 5,
    text: "¿En qué medida las preguntas del Companion le exigieron detenerse a reflexionar profundamente antes de contestar?",
    labelLow: "Nada, respondí lo primero que me vino a la mente",
    labelHigh: "Mucho, promovieron una profunda reflexión",
  },
  {
    id: 6,
    text: "¿En qué medida la sesión le ayudó a descubrir o afinar conclusiones de las que no era plenamente consciente?",
    labelLow: "Nada cambió / Nada se movió",
    labelHigh: "Un cambio real / Conclusión muy clara",
  },
  {
    id: 7,
    text: "Al finalizar la sesión, ¿qué tanto cambió o avanzó su perspectiva en comparación con el momento en que empezó?",
    labelLow: "Nada nuevo, solo saqué a la luz lo que ya sabía",
    labelHigh: "Avancé a un lugar completamente nuevo",
  },
  {
    id: 8,
    text: "¿Qué tan concreto y definido es el resultado (idea, decisión u objetivo) con el que terminó la sesión?",
    labelLow: "Nada concreto / No produje nada",
    labelHigh: "Muy concreto, definido claramente en mis propias palabras",
  },
  {
    id: 9,
    text: "¿Qué tan preciso y claro considera el resultado final obtenido en esta sesión?",
    labelLow: "Nada preciso / Sin resultado claro",
    labelHigh: "Altamente preciso y claro",
  },
  {
    id: 10,
    text: "¿Cuál es el nivel de autoría y apropiación que siente respecto al objetivo que surgió en la sesión?",
    labelLow: "Siento que es una sugerencia del Companion",
    labelHigh: "Es totalmente mío, en mis palabras, y lo defendería",
  },
  {
    id: 11,
    text: "¿Qué tan estructurado, concreto y medible (SMART) considera que quedó su objetivo?",
    labelLow: "Es una aspiración general / Poco definido",
    labelHigh: "Es una meta totalmente concreta y medible",
  },
  {
    id: 12,
    text: "¿Qué tan clara es la conexión de su objetivo con las métricas u objetivos reales de su organización (ej. evaluación de desempeño)?",
    labelLow: "No veo ninguna conexión",
    labelHigh: "Conexión clara y altamente plausible",
  },
  {
    id: 13,
    text: "¿Cómo evaluaría la fluidez de la interacción en términos de tiempos de espera y ausencia de distracciones?",
    labelLow: "Espera excesiva o interrupciones constantes",
    labelHigh: "Interacción totalmente fluida y ágil",
  },
  {
    id: 14,
    text: "¿Qué tan seguro/a y en confianza se sintió respecto a la confidencialidad de sus datos para responder con total franqueza?",
    labelLow: "Inseguro/a, me reservé mucho por inquietud",
    labelHigh: "Totalmente seguro/a, me abrí con franqueza",
  },
  {
    id: 15,
    text: "En términos generales: ¿La sesión dio como resultado un objetivo claro, propio y fruto de una perspectiva nueva que no se habría planteado solo/a?",
    labelLow: "En lo absoluto / No",
    labelHigh: "Sí, claramente",
  },
];

interface SurveyModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: number | null;
  userId: string | null;
  lang: "en" | "es";
}

const overlayCopy = {
  en: {
    title: "Session Survey",
    subtitle: "Rate your experience with this coaching session. All responses are anonymous and help us improve.",
    question: "Question",
    of: "of",
    save: "Submit responses",
    saving: "Saving...",
    success: "Thank you! Your responses have been saved.",
    error: "Could not save responses. Please try again.",
    close: "Close",
    required: "Please answer all questions before submitting.",
  },
  es: {
    title: "Cuestionario de la Sesión",
    subtitle: "Evalúa tu experiencia con esta sesión de coaching. Tus respuestas nos ayudan a mejorar.",
    question: "Pregunta",
    of: "de",
    save: "Enviar respuestas",
    saving: "Guardando...",
    success: "¡Gracias! Tus respuestas han sido guardadas.",
    error: "No se pudieron guardar las respuestas. Intenta de nuevo.",
    close: "Cerrar",
    required: "Por favor responde todas las preguntas antes de enviar.",
  },
};

export default function SurveyModal({ open, onClose, employeeId, userId, lang }: SurveyModalProps) {
  const t = overlayCopy[lang];
  const [responses, setResponses] = useState<Record<string, number>>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSelect = (questionId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [String(questionId)]: value }));
    setError(null);
  };

  const allAnswered = surveyQuestions.every((q) => responses[String(q.id)] !== undefined);

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError(t.required);
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("session_survey_responses")
        .insert({
          employee_id: employeeId,
          user_id: userId,
          responses,
        });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || t.error);
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    if (!submitting) {
      setResponses({});
      setSubmitted(false);
      setError(null);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          animation: "fadeIn 0.25s ease",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "90vw",
          maxWidth: 680,
          maxHeight: "88vh",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          animation: "riseIn 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #e8e0e4",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#6e0431", marginBottom: 4 }}>
                {t.title}
              </h2>
              <p style={{ fontSize: 12, color: "#867b77", lineHeight: 1.5, maxWidth: 480 }}>
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                background: "#f3e8ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                opacity: submitting ? 0.4 : 1,
                transition: "0.15s",
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#e8d4de"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f3e8ee"; }}
            >
              <i className="ri-close-line" style={{ fontSize: 16, color: "#6e0431" }}></i>
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
          }}
        >
          {submitted ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                animation: "riseIn 0.4s ease",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#e8f5e9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <i className="ri-check-line" style={{ fontSize: 32, color: "#2e7d32" }}></i>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#3d3d3d", marginBottom: 6 }}>
                {t.success}
              </h3>
              <button
                onClick={handleClose}
                style={{
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  border: "none",
                  borderRadius: 11,
                  padding: "13px 28px",
                  background: "#b1005d",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  marginTop: 12,
                  transition: "0.15s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {t.close}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {surveyQuestions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: responses[String(q.id)] ? "#faf7f8" : "#fff",
                    border: responses[String(q.id)]
                      ? "1px solid #c9b3b8"
                      : "1px solid #e8e0e4",
                    transition: "0.2s",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#3d3d3d",
                      lineHeight: 1.5,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ color: "#b1005d", fontWeight: 800, marginRight: 6 }}>
                      {q.id}.
                    </span>
                    {q.text}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                      {[1, 2, 3, 4, 5].map((val) => {
                        const selected = responses[String(q.id)] === val;
                        return (
                          <button
                            key={val}
                            onClick={() => handleSelect(q.id, val)}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 3,
                              cursor: "pointer",
                              border: "none",
                              background: "transparent",
                              fontFamily: "inherit",
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 700,
                                transition: "0.15s",
                                background: selected ? "#b1005d" : "#f3e8ee",
                                color: selected ? "#fff" : "#867b77",
                              }}
                            >
                              {val}
                            </div>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: selected ? 700 : 500,
                                color: selected ? "#b1005d" : "#b3a8a5",
                                transition: "0.15s",
                              }}
                            >
                              {val}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "#b3a8a5", maxWidth: "45%", lineHeight: 1.3 }}>
                        {q.labelLow}
                      </span>
                      <span style={{ fontSize: 10, color: "#b3a8a5", maxWidth: "45%", textAlign: "right", lineHeight: 1.3 }}>
                        {q.labelHigh}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!submitted && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e8e0e4",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 11, color: "#867b77" }}>
              {surveyQuestions.filter((q) => responses[String(q.id)]).length} {t.of} {surveyQuestions.length} {lang === "es" ? "respondidas" : "answered"}
            </span>
            {error && (
              <span style={{ fontSize: 11, color: "#b1005d", fontWeight: 600 }}>{error}</span>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 15,
                cursor: submitting ? "not-allowed" : "pointer",
                border: "none",
                borderRadius: 11,
                padding: "13px 30px",
                background: allAnswered ? "#b1005d" : "#d9d2cf",
                color: allAnswered ? "#fff" : "#a09692",
                whiteSpace: "nowrap",
                transition: "0.15s",
                opacity: submitting ? 0.7 : 1,
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { if (allAnswered && !submitting) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={(e) => { if (allAnswered && !submitting) e.currentTarget.style.opacity = "1"; }}
            >
              {submitting ? t.saving : t.save}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}