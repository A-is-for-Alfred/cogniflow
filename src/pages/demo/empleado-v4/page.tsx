import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getSafeSession, runMigrations } from "@/lib/cogniflow";
import V2Header from "./components/V2Header";
import V2Rail from "./components/V2Rail";
import UploadStage from "./components/UploadStage";
import ProcessingAnimation from "./components/ProcessingAnimation";
import QuestionStage from "./components/QuestionStage";
import ChatStage from "./components/ChatStage";
import RoadmapStage from "./components/RoadmapStage";
import ValuesStage from "./components/ValuesStage";
import type { RoadmapData } from "./components/roadmapTypes";
import GoalsChecklist from "@/pages/demo/empleado/components/GoalsChecklist";
import ConsistencyChart from "@/pages/demo/empleado/components/ConsistencyChart";
import FacetasSection from "./components/FacetasSection";
import ReporteSection from "./components/ReporteSection";
import { FontScaleContext, FONT_SCALE_OPTIONS, type FontScaleLevel } from "./FontScaleContext";

export type V2Stage = "upload" | "values" | "processing" | "question" | "chat" | "roadmap";

export interface Bullet {
  text: string;
  kind: "anchor" | "retrieve";
  bullet_id: string;
  index: number;
  recall_window?: string;
  word_count?: number;
}

export interface QuestionIntro {
  raw: string;
  scope: { raw: string; questions: number; minutes: number };
  sentences: {
    position: string | null;
    reader_act: string | null;
    purpose: string | null;
  };
  sentence_count: number;
  facets_cited?: Array<{
    name: string;
    numbered?: boolean;
    score?: number;
    preference?: string;
  }>;
}

export interface QuestionTension {
  tension_id: string;
  name: string;
  tension_type: string;
  pattern?: string;
  reader_act?: string;
  interpersonal_impact?: string;
  involves_oop: boolean;
  facets?: Array<{
    name: string;
    score: number;
    preference: string;
    opposite_pole: string;
  }>;
}

export interface QuestionLint {
  ok: boolean;
  issues: Array<{
    rule: string;
    severity: "error" | "warn";
    message: string;
  }>;
}

export interface QuestionItem {
  number: number;
  tension: QuestionTension;
  intro: QuestionIntro;
  bullets: Bullet[];
  counts: { anchors: number; retrieves: number; bullets: number };
  lint: QuestionLint;
}

export interface CompanionQuestion {
  number: number;
  question_text: string;
  summary?: string;
  vars?: Array<[string, string]>;
  tension?: QuestionTension;
  intro?: QuestionIntro;
  bullets?: Bullet[];
  counts?: { anchors: number; retrieves: number; bullets: number };
  lint?: QuestionLint;
}

export interface ProcessedReport {
  employeeId: number;
  userId: string;
  employeeName: string;
  language: string;
  gender: string;
  questions: CompanionQuestion[];
  profileSummary: string;
  chosenQuestion: CompanionQuestion | null;
  voiceId?: string;
  _pdfFile?: File;
  _formData?: FormData;
  valoresWebhookUrl?: string;
  valoresPayload?: Record<string, unknown>;
  _introRawResponse?: string;
  _introExtractedUrl?: string;
  _introResponseTimestamp?: number;
}

type V2Tab = "journey" | "facet" | "guide";

export default function EmpleadoV4() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<V2Stage>("upload");
  const [lang, setLang] = useState<"en" | "es">("es");
  const [report, setReport] = useState<ProcessedReport | null>(null);
  const [pendingReport, setPendingReport] = useState<ProcessedReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<V2Tab>("journey");
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [fontScaleIndex, setFontScaleIndex] = useState<FontScaleLevel>(1);
  const fontScale = FONT_SCALE_OPTIONS[fontScaleIndex].value;

  // One-time schema migration against the external Postgres (idempotent)
  useEffect(() => {
    if (sessionStorage.getItem("empleado_v4_migrated")) return;
    sessionStorage.setItem("empleado_v4_migrated", "1");
    runMigrations();
  }, []);

  // Auth guard — verify session and load employee data
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSafeSession();
      if (!session) {
        sessionStorage.setItem("empleado_redirect", "/demo/empleado-v4");
        navigate("/demo/auth/empleado");
        return;
      }
      const { data: emp } = await supabase
        .from("employees")
        .select("id, name, language, gender")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (emp) {
        setEmployeeId(emp.id);
        setEmployeeName(emp.name ?? null);
        if (emp.language) setLang(emp.language as "en" | "es");
      }
      setIsLoading(false);
    };
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/demo");
      }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage, activeTab]);

  const handleUploadComplete = (data: ProcessedReport) => {
    if (!data._pdfFile) {
      setReport(data);
      setStage("question");
    } else {
      setPendingReport(data);
      setStage("values");
    }
  };

  const handleValuesComplete = (valoresPayload: Record<string, unknown>) => {
    setPendingReport((prev) => prev ? { ...prev, valoresPayload } : prev);
    setStage("processing");
  };

  const handleProcessingComplete = (updatedReport: ProcessedReport) => {
    setReport(updatedReport);
    setPendingReport(null);
    setStage("question");
  };

  const handleQuestionChosen = (q: CompanionQuestion, voiceId: string) => {
    if (!report) return;
    setReport({ ...report, chosenQuestion: q, voiceId });
    setStage("chat");
  };

  const handleSessionEnd = (roadmap: RoadmapData) => {
    setRoadmapData(roadmap);
    setStage("roadmap");
  };

  const handleNewSessionFromRoadmap = () => {
    setRoadmapData(null);
    if (report) {
      setReport({ ...report, chosenQuestion: null });
    }
    setStage("question");
  };

  const handleViewExistingRoadmap = (roadmap: RoadmapData, existingReport: ProcessedReport) => {
    setReport(existingReport);
    setRoadmapData(roadmap);
    setStage("roadmap");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/demo");
  };

  const STAGE_INDEX: Record<V2Stage, number> = {
    upload: 0,
    values: 1,
    processing: 2,
    question: 3,
    chat: 4,
    roadmap: 5,
  };

  const tabLabels: Record<V2Tab, { en: string; es: string }> = {
    journey: { en: "Journey", es: "Viaje" },
    facet: { en: "My Facets", es: "Mis facetas" },
    guide: { en: "Report", es: "Reporte" },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf7f8" }}>
        <div className="flex items-center gap-3" style={{ color: "#867b77" }}>
          <i className="ri-loader-4-line animate-spin text-2xl"></i>
          <span className="text-sm font-semibold">{lang === "es" ? "Cargando..." : "Loading..."}</span>
        </div>
      </div>
    );
  }

  const reportLoaded = report !== null;

  return (
    <FontScaleContext.Provider value={fontScale}>
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Open Sans', 'Segoe UI', Roboto, system-ui, sans-serif", background: "#faf7f8", color: "#3d3d3d" }}
    >
      <V2Header
        lang={lang}
        onToggleLang={() => setLang((l) => (l === "es" ? "en" : "es"))}
        onBack={() => navigate("/demo")}
        onLogout={handleLogout}
        employeeName={report?.employeeName ?? employeeName}
        fontScaleIndex={fontScaleIndex}
        onFontScaleChange={setFontScaleIndex}
      />
      <V2Rail currentStage={stage} lang={lang} />

      {reportLoaded && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {(Object.keys(tabLabels) as V2Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: activeTab === tab ? "#8f0f48" : "#F3F4F6",
                  color: activeTab === tab ? "#fff" : "#6B7280",
                  fontSize: 15,
                }}
              >
                {tab === "journey" && <i className="ri-compass-3-line text-base"></i>}
                {tab === "facet" && <i className="ri-bar-chart-box-line text-base"></i>}
                {tab === "guide" && <i className="ri-file-text-line text-base"></i>}
                {tabLabels[tab][lang]}
              </button>
            ))}
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: reportLoaded ? "12px 28px 70px" : "34px 28px 70px", zoom: fontScale }}>
        {(!reportLoaded || activeTab === "journey") && (
          <>
            {!reportLoaded && (
              <>
                {stage === "upload" && (
                  <UploadStage lang={lang} employeeName={employeeName} employeeId={employeeId} onComplete={handleUploadComplete} onViewRoadmap={handleViewExistingRoadmap} />
                )}
                {stage === "values" && pendingReport && (
                  <ValuesStage
                    lang={lang}
                    userId={pendingReport.userId}
                    employeeId={pendingReport.employeeId}
                    valoresWebhookUrl={pendingReport.valoresWebhookUrl}
                    onComplete={handleValuesComplete}
                  />
                )}
                {stage === "processing" && pendingReport && (
                  <ProcessingAnimation lang={lang} report={pendingReport} onComplete={handleProcessingComplete} />
                )}
              </>
            )}

            {reportLoaded && activeTab === "journey" && stage === "question" && report && (
              <QuestionStage
                lang={lang}
                questions={report.questions}
                profileSummary={report.profileSummary}
                onChoose={handleQuestionChosen}
              />
            )}

            {reportLoaded && activeTab === "journey" && stage === "chat" && report && report.chosenQuestion && (
              <>
                <div style={{ marginBottom: 16 }}>
                </div>
                <ChatStage
                  lang={lang}
                  report={report}
                  onBack={() => setStage("question")}
                  onSessionEnd={handleSessionEnd}
                />
              </>
            )}

            {reportLoaded && activeTab === "journey" && stage === "roadmap" && roadmapData && report && (
              <RoadmapStage
                lang={lang}
                roadmap={roadmapData}
                employeeName={report.employeeName || employeeName || ""}
                employeeId={report.employeeId}
                userId={report.userId}
                onNewSession={handleNewSessionFromRoadmap}
              />
            )}

            {reportLoaded && activeTab === "journey" && stage !== "question" && stage !== "chat" && stage !== "roadmap" && (
              <div style={{
                background: "#fff",
                border: "1px solid #d9d2cf",
                borderRadius: 16,
                padding: "40px 28px",
                textAlign: "center",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", background: "#f3e8ee",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <i className="ri-compass-3-line" style={{ fontSize: 28, color: "#b1005d" }}></i>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#6e0431", marginBottom: 8 }}>
                  {lang === "es" ? "Tu viaje con Cogniflow" : "Your Cogniflow journey"}
                </h3>
                <p style={{ fontSize: 14, color: "#867b77", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                  {lang === "es"
                    ? "Sube tu reporte para comenzar tu viaje personalizado de crecimiento."
                    : "Upload your report to start your personalized growth journey."}
                </p>
              </div>
            )}
          </>
        )}

        {reportLoaded && activeTab === "facet" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FacetasSection employeeId={report?.employeeId} />
            </div>
            <div className="flex flex-col gap-6">
              <GoalsChecklist />
              <ConsistencyChart />
            </div>
          </div>
        )}

        {reportLoaded && activeTab === "guide" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ReporteSection employeeId={report?.employeeId} />
            </div>
            <div className="flex flex-col gap-6">
              <GoalsChecklist />
              <ConsistencyChart />
            </div>
          </div>
        )}
      </main>
    </div>
    </FontScaleContext.Provider>
  );
}