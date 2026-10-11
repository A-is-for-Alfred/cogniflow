import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface SurveyQuestion {
  id: number;
  text: string;
  labelLow: string;
  labelHigh: string;
}

const surveyQuestions: SurveyQuestion[] = [
  { id: 1, text: "¿En qué medida se sintió motivado/a a seguir respondiendo de manera voluntaria desde el inicio de la sesión?", labelLow: "Nada motivado", labelHigh: "Completamente enganchado" },
  { id: 2, text: "¿Qué tan creíbles y valiosas le parecieron las primeras preguntas de la sesión?", labelLow: "Nada creíbles", labelHigh: "Muy valiosas" },
  { id: 3, text: "¿Cómo calificaría el tono y estilo de las preguntas planteadas por el Companion?", labelLow: "Genéricas y artificiales", labelHigh: "Nivel experto" },
  { id: 4, text: "¿Qué tan personalizadas y relevantes sintió las preguntas para su situación individual?", labelLow: "Muy genéricas", labelHigh: "Claramente personalizadas" },
  { id: 5, text: "¿En qué medida las preguntas del Companion le exigieron detenerse a reflexionar profundamente?", labelLow: "Nada, respondí sin pensar", labelHigh: "Mucho, profunda reflexión" },
  { id: 6, text: "¿En qué medida la sesión le ayudó a descubrir o afinar conclusiones de las que no era plenamente consciente?", labelLow: "Nada cambió", labelHigh: "Cambio real y claro" },
  { id: 7, text: "Al finalizar la sesión, ¿qué tanto cambió o avanzó su perspectiva?", labelLow: "Nada nuevo", labelHigh: "Avancé a un lugar nuevo" },
  { id: 8, text: "¿Qué tan concreto y definido es el resultado con el que terminó la sesión?", labelLow: "Nada concreto", labelHigh: "Muy concreto y definido" },
  { id: 9, text: "¿Qué tan preciso y claro considera el resultado final obtenido en esta sesión?", labelLow: "Nada preciso", labelHigh: "Altamente preciso y claro" },
  { id: 10, text: "¿Cuál es el nivel de autoría y apropiación que siente respecto al objetivo que surgió en la sesión?", labelLow: "Sugerencia del Companion", labelHigh: "Totalmente mío, lo defendería" },
  { id: 11, text: "¿Qué tan estructurado, concreto y medible (SMART) considera que quedó su objetivo?", labelLow: "Aspiración general", labelHigh: "Meta concreta y medible" },
  { id: 12, text: "¿Qué tan clara es la conexión de su objetivo con las métricas u objetivos reales de su organización?", labelLow: "No veo conexión", labelHigh: "Conexión clara y plausible" },
  { id: 13, text: "¿Cómo evaluaría la fluidez de la interacción en términos de tiempos de espera y ausencia de distracciones?", labelLow: "Espera excesiva", labelHigh: "Totalmente fluida y ágil" },
  { id: 14, text: "¿Qué tan seguro/a y en confianza se sintió respecto a la confidencialidad de sus datos?", labelLow: "Inseguro/a, me reservé", labelHigh: "Totalmente seguro/a" },
  { id: 15, text: "En términos generales: ¿La sesión dio como resultado un objetivo claro, propio y fruto de una perspectiva nueva?", labelLow: "En lo absoluto", labelHigh: "Sí, claramente" },
];

interface SurveyRow {
  id: number;
  employee_id: number;
  user_id: string;
  responses: Record<string, number>;
  created_at: string;
}

interface EmployeeInfo {
  id: number;
  name: string;
  position: string;
  company_id: number;
  company_name: string;
}

export default function SurveysPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<SurveyRow[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Record<number, EmployeeInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [testState, setTestState] = useState("NOT SET");

  useEffect(() => {
    setTestState("EFFECT RAN");
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    try {
      // 1) Fetch surveys
      const { data: surveyData, error: surveyError } = await supabase
        .from("session_survey_responses")
        .select("id, employee_id, user_id, responses, created_at")
        .order("created_at", { ascending: false });

      if (surveyError) {
        setDebugInfo(`Survey error: ${JSON.stringify(surveyError)}`);
        throw surveyError;
      }

      const rows: SurveyRow[] = (surveyData || []) as SurveyRow[];
      setDebugInfo(`Fetched ${rows.length} surveys. Raw data: ${JSON.stringify(surveyData ?? null).slice(0, 300)}`);
      setSurveys(rows);

      if (rows.length > 0) {
        const employeeIds = [...new Set(rows.map((s) => s.employee_id))];

        const { data: empData, error: empError } = await supabase
          .from("employees")
          .select("id, name, position, company_id")
          .in("id", employeeIds);

        if (empError) {
          setDebugInfo((prev) => `${prev} | Emp error: ${JSON.stringify(empError)}`);
          throw empError;
        }

        const employees = (empData || []) as { id: number; name: string; position: string; company_id: number }[];
        setDebugInfo((prev) => `${prev} | Fetched ${employees.length} employees.`);

        const companyIds = [...new Set(employees.map((e) => e.company_id).filter(Boolean))];

        let companyMap: Record<number, string> = {};
        if (companyIds.length > 0) {
          const { data: compData, error: compError } = await supabase
            .from("companies")
            .select("id, name")
            .in("id", companyIds);

          if (compError) {
            setDebugInfo((prev) => `${prev} | Comp error: ${JSON.stringify(compError)}`);
            // Don't throw for companies — just use empty names
          } else {
            (compData || []).forEach((c: { id: number; name: string }) => {
              companyMap[c.id] = c.name;
            });
            setDebugInfo((prev) => `${prev} | Fetched ${(compData || []).length} companies.`);
          }
        }

        const map: Record<number, EmployeeInfo> = {};
        employees.forEach((e) => {
          map[e.id] = {
            id: e.id,
            name: e.name,
            position: e.position,
            company_id: e.company_id,
            company_name: companyMap[e.company_id] || "",
          };
        });
        setEmployeeMap(map);
      }
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || "Error al cargar las encuestas";
      setError(msg);
    } finally {
      setLoading(false);
      setTestState("FETCH DONE");
    }
  };

  const getQuestionAvg = (questionId: number): number => {
    const values = surveys
      .map((s) => {
        const r = s.responses;
        if (typeof r === "string") {
          try {
            const parsed = JSON.parse(r);
            return parsed[String(questionId)];
          } catch {
            return undefined;
          }
        }
        return r[String(questionId)];
      })
      .filter((v): v is number => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const getOverallAvg = (responses: Record<string, number>): number => {
    let vals: number[] = [];
    if (typeof responses === "string") {
      try {
        const parsed = JSON.parse(responses);
        vals = Object.values(parsed).filter((v) => typeof v === "number");
      } catch {
        vals = [];
      }
    } else {
      vals = Object.values(responses).filter((v) => typeof v === "number");
    }
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const avgColor = (val: number): { bg: string; text: string } => {
    if (val >= 4) return { bg: "#e8f5e9", text: "#2e7d32" };
    if (val >= 3) return { bg: "#fff3e0", text: "#e65100" };
    return { bg: "#fce4ec", text: "#c62828" };
  };

  const scoreBarColor = (val: number): string => {
    if (val >= 4) return "#4caf50";
    if (val >= 3) return "#ff9800";
    return "#f44336";
  };

  const formatDate = (d: string): string => {
    const date = new Date(d);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const globalAvg = surveys.length > 0
    ? surveys.reduce((acc, s) => acc + getOverallAvg(s.responses), 0) / surveys.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/demo")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            Demo
          </button>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#A78BFA" }}
            >
              <i className="ri-brain-line text-white text-sm"></i>
            </span>
            <span className="font-bold text-sm text-black">Cogniflow</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
          >
            <i className="ri-survey-line mr-1"></i>
            Encuestas de Sesión
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-8">
        {/* Test state */}
        <div className="bg-red-100 border border-red-300 rounded-xl p-4 text-red-800 font-bold text-sm">
          TEST STATE: {testState} | Surveys count: {surveys.length} | Loading: {String(loading)} | Error: {error ?? "none"}
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 font-mono whitespace-pre-wrap">
            <strong>Debug:</strong> {debugInfo}
          </div>
        )}

        {/* Global stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EDE9FE" }}>
                <i className="ri-file-list-3-line text-lg" style={{ color: "#7C3AED" }}></i>
              </div>
              <span className="text-xs font-semibold text-gray-400">TOTAL ENCUESTAS</span>
            </div>
            <p className="text-3xl font-extrabold text-black">
              {loading ? "—" : surveys.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
                <i className="ri-star-line text-lg" style={{ color: "#D97706" }}></i>
              </div>
              <span className="text-xs font-semibold text-gray-400">PROMEDIO GLOBAL</span>
            </div>
            <p className="text-3xl font-extrabold text-black">
              {loading ? "—" : `${globalAvg.toFixed(1)} / 5`}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D1FAE5" }}>
                <i className="ri-user-smile-line text-lg" style={{ color: "#059669" }}></i>
              </div>
              <span className="text-xs font-semibold text-gray-400">EMPLEADOS</span>
            </div>
            <p className="text-3xl font-extrabold text-black">
              {loading ? "—" : Object.keys(employeeMap || {}).length}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FCE7F3" }}>
                <i className="ri-calendar-line text-lg" style={{ color: "#BE185D" }}></i>
              </div>
              <span className="text-xs font-semibold text-gray-400">ÚLTIMA ENCUESTA</span>
            </div>
            <p className="text-sm font-bold text-black leading-tight">
              {loading || surveys.length === 0
                ? "—"
                : formatDate(surveys[0].created_at)}
            </p>
          </div>
        </div>

        {/* Per-question averages */}
        {!loading && surveys.length > 0 && (
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
            <h2 className="text-base font-bold text-black mb-5 flex items-center gap-2">
              <i className="ri-bar-chart-grouped-line" style={{ color: "#7C3AED" }}></i>
              Promedio por pregunta (escala 1–5)
            </h2>
            <div className="space-y-3">
              {surveyQuestions.map((q) => {
                const avg = getQuestionAvg(q.id);
                const pct = (avg / 5) * 100;
                return (
                  <div key={q.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-8 text-right flex-shrink-0">
                      Q{q.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 truncate pr-2">{q.text}</span>
                        <span
                          className="text-xs font-extrabold flex-shrink-0 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: avgColor(avg).bg, color: avgColor(avg).text }}
                        >
                          {avg.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: scoreBarColor(avg) }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 w-10 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Survey responses list */}
        <div>
          <h2 className="text-base font-bold text-black mb-4 flex items-center gap-2">
            <i className="ri-survey-line" style={{ color: "#7C3AED" }}></i>
            Respuestas individuales
          </h2>

          {loading && (
            <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
              <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Cargando encuestas...</p>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <i className="ri-error-warning-line text-xl" style={{ color: "#c62828" }}></i>
              </div>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <button
                onClick={fetchSurveys}
                className="text-xs font-semibold px-4 py-2 rounded-full cursor-pointer text-white whitespace-nowrap"
                style={{ backgroundColor: "#7C3AED" }}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && surveys.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 2px 16px rgba(91,46,230,0.06)" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#EDE9FE" }}>
                <i className="ri-inbox-line text-2xl" style={{ color: "#7C3AED" }}></i>
              </div>
              <h3 className="text-lg font-bold text-black mb-1">Sin encuestas aún</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Cuando los empleados completen el cuestionario después de una sesión, sus respuestas aparecerán aquí.
              </p>
            </div>
          )}

          {!loading && !error && surveys.length > 0 && (
            <div className="space-y-3">
              {surveys.map((survey) => {
                const avg = getOverallAvg(survey.responses);
                const employee = employeeMap[survey.employee_id];
                const isExpanded = expandedId === survey.id;
                const color = avgColor(avg);

                return (
                  <div
                    key={survey.id}
                    className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      boxShadow: isExpanded
                        ? "0 4px 24px rgba(91,46,230,0.10)"
                        : "0 2px 12px rgba(91,46,230,0.05)",
                    }}
                  >
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : survey.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#EDE9FE" }}
                      >
                        <span className="text-sm font-extrabold" style={{ color: "#7C3AED" }}>
                          {employee?.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black truncate">
                          {employee?.name || `Empleado #${survey.employee_id}`}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {employee?.position || "Sin cargo"}
                          {employee?.company_name ? ` · ${employee.company_name}` : ""}
                        </p>
                      </div>

                      <div
                        className="flex-shrink-0 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                        style={{ backgroundColor: color.bg }}
                      >
                        <i className="ri-star-fill text-xs" style={{ color: color.text }}></i>
                        <span className="text-xs font-extrabold" style={{ color: color.text }}>
                          {avg.toFixed(1)}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block w-36 text-right">
                        {formatDate(survey.created_at)}
                      </span>

                      <i
                        className={`ri-arrow-down-s-line text-gray-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      ></i>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {surveyQuestions.map((q) => {
                            let val: number | undefined;
                            const r = survey.responses;
                            if (typeof r === "string") {
                              try {
                                const parsed = JSON.parse(r);
                                val = parsed[String(q.id)];
                              } catch {
                                val = undefined;
                              }
                            } else {
                              val = r[String(q.id)];
                            }
                            const barPct = val ? (val / 5) * 100 : 0;
                            return (
                              <div
                                key={q.id}
                                className="flex items-start gap-3 p-3 rounded-xl"
                                style={{ backgroundColor: "#fafafa" }}
                              >
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor: val ? scoreBarColor(val) + "1A" : "#f0f0f0",
                                  }}
                                >
                                  <span
                                    className="text-xs font-extrabold"
                                    style={{ color: val ? scoreBarColor(val) : "#bbb" }}
                                  >
                                    {val ?? "—"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-700 leading-relaxed mb-1.5">
                                    <span className="font-bold text-gray-400 mr-1">Q{q.id}.</span>
                                    {q.text}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                          width: `${barPct}%`,
                                          backgroundColor: val ? scoreBarColor(val) : "#e0e0e0",
                                        }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                                      {q.labelLow} → {q.labelHigh}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            <i className="ri-calendar-line mr-1"></i>
                            {formatDate(survey.created_at)}
                          </span>
                          <span className="text-xs text-gray-400">
                            <i className="ri-fingerprint-line mr-1"></i>
                            ID: {survey.employee_id}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}