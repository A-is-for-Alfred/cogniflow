import { useRef, useState, useEffect } from "react";
import { supabase, getSafeSession } from "@/lib/supabase";
import type { ProcessedReport, CompanionQuestion } from "../page";
import type { RoadmapData } from "./ChatStage";

const WEBHOOK_URL = "https://ttracy007.app.n8n.cloud/webhook/intro";

interface UploadStageProps {
  lang: "en" | "es";
  employeeName: string | null;
  employeeId: number | null;
  onComplete: (data: ProcessedReport) => void;
  onViewRoadmap?: (roadmap: RoadmapData, report: ProcessedReport) => void;
}

const copy = {
  en: {
    greeting: (name: string) => `Hi, ${name.split(" ")[0]}.`,
    eyebrow: "Your starting point",
    title_pre: "One document.",
    title_post: "Your whole map.",
    sub: "Upload your MBTI personality report and Cogniflow will analyze it, converse with you to identify your greatest areas of opportunity, and build a personalized roadmap that will help you reach new levels of success.",
    bullet1: "Upload your MBTI report (PDF)",
    bullet2: "Cogniflow processes your profile",
    bullet3: "You choose your first question",
    bullet4: "A real 20-minute conversation",
    bullet5: "Cogniflow generates your personalized roadmap",
    attach: "Attach your MBTI report",
    change: "Change file",
    send: "Start my journey →",
    pdf_only: "Only PDF files are accepted.",
    attach_first: "Please attach your PDF report first.",
    no_auth: "Could not authenticate. Please log in again.",
    error: "There was an error processing your report. Please try again.",
    where_label: "Where this takes you",
    y_label: "PERSONAL GROWTH →",
    x_label: "ORGANIZATIONAL GOALS →",
    here: "You are here",
    already_done: "Your profile is ready — no need to upload again.",
    continue_existing: "Continue with your saved profile →",
    checking_existing: "Checking your profile…",
    db_error: "Could not load your profile. Please try uploading again.",
    roadmap_ready: "You have a completed roadmap!",
    view_roadmap: "View my roadmap →",
    or_continue: "or continue your journey again",
  },
  es: {
    greeting: (name: string) => `Hola, ${name.split(" ")[0]}.`,
    eyebrow: "Tu punto de partida",
    title_pre: "Un documento.",
    title_post: "Todo tu mapa.",
    sub: "Sube tu reporte de personalidad MBTI y Cogniflow lo analizará, conversará contigo para identificar tus mayores áreas de oportunidad y construirá un roadmap personalizado para ti que te ayudará a alcanzar nuevos niveles de éxito.",
    bullet1: "Sube tu reporte MBTI (PDF)",
    bullet2: "Cogniflow procesa tu perfil",
    bullet3: "Elige tu primera pregunta",
    bullet4: "Una conversación real de 20 minutos",
    bullet5: "Cogniflow genera tu roadmap personalizado",
    attach: "Adjunta tu reporte MBTI — revisa tu correo",
    change: "Cambiar archivo",
    send: "Iniciar mi camino →",
    pdf_only: "Solo se aceptan archivos PDF.",
    attach_first: "Por favor adjunta tu reporte PDF primero.",
    no_auth: "No se pudo autenticar. Por favor inicia sesión nuevamente.",
    error: "Hubo un error al procesar tu reporte. Por favor intenta de nuevo.",
    where_label: "Hacia dónde te lleva esto",
    y_label: "CRECIMIENTO PERSONAL →",
    x_label: "METAS ORGANIZACIONALES →",
    here: "Estás aquí",
    already_done: "Tu perfil ya está listo — no necesitas subirlo de nuevo.",
    continue_existing: "Continuar con tu perfil guardado →",
    checking_existing: "Revisando tu perfil…",
    db_error: "No se pudo cargar tu perfil. Intenta subir tu reporte de nuevo.",
    roadmap_ready: "¡Ya tienes un roadmap completado!",
    view_roadmap: "Ver mi roadmap →",
    or_continue: "o continúa tu viaje de nuevo",
  },
};

export default function UploadStage({ lang, employeeName, employeeId, onComplete, onViewRoadmap }: UploadStageProps) {
  const t = copy[lang];
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [hasExistingData, setHasExistingData] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingChecked, setExistingChecked] = useState(false);
  const [hasExistingRoadmap, setHasExistingRoadmap] = useState(false);
  const [existingRoadmapData, setExistingRoadmapData] = useState<RoadmapData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if employee already has a companion guide + facetas + roadmap in DB
  useEffect(() => {
    if (!employeeId) {
      setExistingChecked(true);
      return;
    }
    setCheckingExisting(true);
    const check = async () => {
      try {
        const { data: reportData } = await supabase
          .from("reportes")
          .select("id, questions")
          .eq("usuario_id", employeeId)
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle();

        let hasReport = false;
        if (reportData && reportData.questions) {
          const { data: facetasData } = await supabase
            .from("resultados_facetas")
            .select("id")
            .eq("reporte_id", reportData.id)
            .limit(1);
          hasReport = !!(facetasData && facetasData.length > 0);
        }
        setHasExistingData(hasReport);

        // Check for existing roadmap
        const { data: roadmapRow } = await supabase
          .from("roadmaps")
          .select("id, roadmap_summary, objectives")
          .eq("employee_id", employeeId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (roadmapRow && roadmapRow.objectives) {
          const objectives = Array.isArray(roadmapRow.objectives)
            ? roadmapRow.objectives
            : [];
          setExistingRoadmapData({
            roadmap_summary: roadmapRow.roadmap_summary || "",
            objectives,
          });
          setHasExistingRoadmap(true);
        } else {
          setHasExistingRoadmap(false);
          setExistingRoadmapData(null);
        }
      } catch {
        setHasExistingData(false);
        setHasExistingRoadmap(false);
      }
      setCheckingExisting(false);
      setExistingChecked(true);
    };
    check();
  }, [employeeId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      setError(t.pdf_only);
      return;
    }
    setError("");
    setPdfFile(file);
  };

  const handleSend = async () => {
    if (!pdfFile) { setError(t.attach_first); return; }

    const session = await getSafeSession();
    if (!session) { setError(t.no_auth); return; }

    const { data: empData } = await supabase
      .from("employees")
      .select("id, name, language, gender")
      .eq("user_id", session.user.id)
      .maybeSingle();

    const empId = empData?.id ?? 0;
    const empName = empData?.name ?? session.user.email ?? "Usuario";
    const language = empData?.language ?? lang;
    const gender = empData?.gender ?? "";

    const formData = new FormData();
    formData.append("categoria", "archivo");
    formData.append("empleado", empName);
    formData.append("user_id", session.user.id);
    formData.append("archivo", pdfFile, pdfFile.name);

    // Send to intro webhook and capture the dynamic valores URL
    let valoresWebhookUrl: string | undefined;
    let rawText = "";
    try {
      const response = await fetch(WEBHOOK_URL, { method: "POST", body: formData });
      if (!response.ok) {
        let bodyPreview = "";
        try { bodyPreview = await response.text(); } catch { bodyPreview = "(could not read body)"; }
        setError(`${t.error}\n\n[Webhook intro] HTTP ${response.status}: ${bodyPreview.slice(0, 500)}`);
        return;
      }
      rawText = await response.text();
      let data: any = null;
      try { data = JSON.parse(rawText); } catch {
        setError(`${t.error}\n\n[Webhook intro] Respuesta no es JSON válido:\n${rawText.slice(0, 500)}`);
        return;
      }

      // Unwrap common n8n nesting patterns
      const rawData = JSON.stringify(data);
      if (Array.isArray(data)) data = data[0];
      if (data?.data) data = data.data;
      if (data?.body) data = data.body;

      valoresWebhookUrl = data?.webhook;
      if (!valoresWebhookUrl || typeof valoresWebhookUrl !== "string") {
        setError(`${t.error}\n\n[Webhook intro] Falta campo "webhook" en la respuesta.\nData recibida: ${JSON.stringify(data).slice(0, 500)}\n\nRespuesta cruda: ${rawData.slice(0, 500)}`);
        return;
      }
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || "Error desconocido";
      const extra = err?.cause ? `\nCause: ${err.cause}` : "";
      setError(`${t.error}\n\n[Webhook intro] Fetch falló. No se recibió respuesta.\nError: ${errMsg}${extra}`);
      return;
    }

    onComplete({
      employeeId: empId,
      userId: session.user.id,
      employeeName: empName,
      language,
      gender,
      questions: [],
      profileSummary: "",
      chosenQuestion: null,
      _pdfFile: pdfFile,
      _formData: formData,
      valoresWebhookUrl,
      // Debug — raw response from intro webhook so we can verify the dynamic URL
      _introRawResponse: rawText,
      _introExtractedUrl: valoresWebhookUrl,
      // Timestamp for 90-second delay before calling valores webhook
      _introResponseTimestamp: Date.now(),
    } as any);
  };

  // Start journey using existing DB data — no file, no webhook, no processing
  const handleStartFromDb = async () => {
    const session = await getSafeSession();
    if (!session) { setError(t.no_auth); return; }

    try {
      const { data: empData } = await supabase
        .from("employees")
        .select("id, name, language, gender")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!empData) { setError(t.db_error); return; }

      const { data: reportData } = await supabase
        .from("reportes")
        .select("id, questions, profile_summary, mbti_type, profile_name")
        .eq("usuario_id", empData.id)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!reportData) { setError(t.db_error); return; }

      const questions: CompanionQuestion[] = Array.isArray(reportData.questions)
        ? (reportData.questions as any[]).map((q: any) => ({
            number: q.number ?? 0,
            question_text: q.question_text ?? "",
            summary: q.question_text?.slice(0, 80) + "…",
          }))
        : [];

      onComplete({
        employeeId: empData.id,
        userId: session.user.id,
        employeeName: empData.name ?? session.user.email ?? "Usuario",
        language: empData.language ?? lang,
        gender: empData.gender ?? "",
        questions,
        profileSummary: reportData.profile_summary || "",
        chosenQuestion: null,
      } as ProcessedReport);
    } catch {
      setError(t.db_error);
    }
  };

  const handleStart = () => {
    setError("");
    if (pdfFile) {
      handleSend();
    } else if (hasExistingData) {
      handleStartFromDb();
    }
  };

  const handleViewRoadmap = async () => {
    if (!existingRoadmapData || !onViewRoadmap) return;
    const session = await getSafeSession();
    if (!session) { setError(t.no_auth); return; }
    try {
      const { data: empData } = await supabase
        .from("employees")
        .select("id, name, language, gender")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!empData) { setError(t.db_error); return; }
      const { data: reportData } = await supabase
        .from("reportes")
        .select("id, questions, profile_summary")
        .eq("usuario_id", empData.id)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();
      const questions: CompanionQuestion[] = Array.isArray(reportData?.questions)
        ? (reportData.questions as any[]).map((q: any) => ({
            number: q.number ?? 0,
            question_text: q.question_text ?? "",
            summary: q.question_text?.slice(0, 80) + "…",
          }))
        : [];
      const report: ProcessedReport = {
        employeeId: empData.id,
        userId: session.user.id,
        employeeName: empData.name ?? session.user.email ?? "Usuario",
        language: empData.language ?? lang,
        gender: empData.gender ?? "",
        questions,
        profileSummary: reportData?.profile_summary || "",
        chosenQuestion: null,
      };
      onViewRoadmap(existingRoadmapData, report);
    } catch {
      setError(t.db_error);
    }
  };

  const canStart = !!pdfFile || hasExistingData;

  return (
    <div>
      {/* Vignette mountain card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #d9d2cf",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(110,4,49,.05),0 8px 26px rgba(110,4,49,.08)",
          overflow: "hidden",
        }}
      >
        {/* Mountain SVG header */}
        <svg
          viewBox="0 0 820 140"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: "block", width: "100%", height: 140 }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3e8ee" />
              <stop offset="100%" stopColor="#faf7f8" />
            </linearGradient>
          </defs>
          <rect width="820" height="140" fill="url(#skyGrad)" />
          {/* Sun */}
          <circle cx="680" cy="35" r="18" fill="#f5802c" opacity="0.85" />
          {/* Mountains back */}
          <path d="M0,120 L80,60 L160,100 L240,45 L320,85 L400,30 L480,70 L560,20 L640,55 L720,10 L820,40 L820,140 L0,140 Z" fill="#8f0f48" opacity="0.12" />
          {/* Mountains mid */}
          <path d="M0,135 L100,90 L200,115 L320,68 L440,100 L560,48 L680,80 L820,52 L820,140 L0,140 Z" fill="#8f0f48" opacity="0.22" />
          {/* Mountains front */}
          <path d="M0,140 L140,108 L280,135 L420,95 L560,125 L680,85 L820,105 L820,140 Z" fill="#8f0f48" opacity="0.38" />
          {/* Path line */}
          <path d="M60,138 C150,130 240,120 340,108 C420,100 500,88 600,72 C680,60 740,48 780,38" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeDasharray="5 9" strokeLinecap="round" />
          {/* Flag at summit */}
          <line x1="778" y1="38" x2="778" y2="20" stroke="#f5802c" strokeWidth="2" />
          <path d="M778,20 L795,26 L778,32 Z" fill="#f5802c" />
        </svg>

        <div style={{ padding: "26px 28px 30px" }}>
          {employeeName && (
            <p style={{ fontSize: 14, fontWeight: 700, color: "#6e0431", marginBottom: 12 }}>
              {t.greeting(employeeName)}
            </p>
          )}
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#b1005d",
              marginBottom: 8,
            }}
          >
            {t.eyebrow}
          </p>
          <h1
            style={{
              fontSize: 26,
              lineHeight: 1.2,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#6e0431",
              marginBottom: 8,
            }}
          >
            {t.title_pre} <span style={{ color: "#b1005d" }}>{t.title_post}</span>
          </h1>
          <p style={{ fontSize: 14, color: "#5a5050", lineHeight: 1.6, marginBottom: 20, maxWidth: 480 }}>
            {t.sub}
          </p>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {[t.bullet1, t.bullet2, t.bullet3, t.bullet4, t.bullet5].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: ["#b1005d", "#752b8c", "#00a99b", "#f5802c", "#2d8f6a"][i],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 13, color: "#3d3d3d", fontWeight: 600 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Trajectory chart */}
          <div
            style={{
              background: "#faf7f8",
              border: "1px solid #d9d2cf",
              borderRadius: 12,
              padding: "14px 16px 8px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#867b77",
                marginBottom: 6,
              }}
            >
              {t.where_label}
            </p>
            <svg viewBox="0 0 560 150" style={{ width: "100%", height: "auto", display: "block" }}>
              <line x1="44" y1="122" x2="540" y2="122" stroke="#d9d2cf" strokeWidth="1.5" />
              <line x1="44" y1="122" x2="44" y2="14" stroke="#d9d2cf" strokeWidth="1.5" />
              <text x="292" y="143" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#867b77">{t.x_label}</text>
              <text x="16" y="70" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#867b77" transform="rotate(-90 16 70)">{t.y_label}</text>
              <path
                d="M66,112 C160,104 220,84 300,62 C380,42 450,32 516,22"
                fill="none"
                stroke="#b1005d"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 430,
                  strokeDashoffset: 430,
                  animation: "drawTraj 1.5s 0.25s cubic-bezier(.3,.6,.3,1) forwards",
                }}
              />
              <circle cx="66" cy="112" r="6.5" fill="#752b8c" />
              <text x="66" y="97" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#3d3d3d">{t.here}</text>
              <path d="M516,22 L532,16 L524,32 Z" fill="#b1005d" />
            </svg>
          </div>

          {/* Existing data notice — shown when profile is already in DB */}
          {existingChecked && hasExistingData && !pdfFile && (
            <div
              style={{
                background: "#f0faf7",
                border: "1px solid #c4e6d9",
                borderRadius: 10,
                padding: "11px 15px",
                marginBottom: 16,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <i className="ri-check-double-line" style={{ fontSize: 18, color: "#2d8f6a", marginTop: 1, flexShrink: 0 }}></i>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1a6b4a", marginBottom: 3 }}>
                  {t.already_done}
                </p>
                <p style={{ fontSize: 12, color: "#3d735c", lineHeight: 1.5 }}>
                  {lang === "es"
                    ? "Tu companion guide y facetas ya están en la base de datos. Puedes continuar directamente."
                    : "Your companion guide and facets are already in the database. Continue directly."}
                </p>
              </div>
            </div>
          )}

          {/* Existing roadmap notice — shown when roadmap is already completed */}
          {existingChecked && hasExistingRoadmap && !pdfFile && (
            <div
              style={{
                background: "linear-gradient(135deg, #f0f6fa 0%, #e6f0f6 100%)",
                border: "1px solid #b8d4e3",
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #006c93, #005676)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i className="ri-flag-line" style={{ fontSize: 18, color: "#fff" }}></i>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#004d6b", marginBottom: 3 }}>
                    {t.roadmap_ready}
                  </p>
                  <p style={{ fontSize: 12, color: "#1a556e", lineHeight: 1.5 }}>
                    {lang === "es"
                      ? "Ya completaste una sesión y tienes tus 4 objetivos de crecimiento guardados. Puedes verlos cuando quieras."
                      : "You've completed a session and your 4 growth objectives are saved. View them anytime."}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={handleViewRoadmap}
                style={{
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #006c93, #005676)",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  transition: "0.15s",
                  letterSpacing: "0.01em",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  <i className="ri-map-pin-line" style={{ marginRight: 6 }}></i>
                  {t.view_roadmap}
                </button>
                {hasExistingData && (
                  <span style={{ fontSize: 12, color: "#1a556e" }}>
                    {lang === "es" ? "o continúa tu viaje de nuevo" : "or continue your journey again"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Upload area */}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handleFile}
          />

          {pdfFile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#f3e8ee",
                borderRadius: 12,
                padding: "12px 16px",
                border: "1px solid #d9d2cf",
                marginBottom: 16,
              }}
            >
              <i className="ri-file-pdf-line" style={{ fontSize: 22, color: "#b1005d" }}></i>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#6e0431", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pdfFile.name}
                </p>
                <p style={{ fontSize: 11, color: "#867b77" }}>{(pdfFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => { setPdfFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#867b77", fontSize: 16 }}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
              {/* PDF vertical badge */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: "#8f0f48",
                  borderRadius: "12px 0 0 12px",
                  padding: "0 14px",
                  minWidth: 48,
                  flexShrink: 0,
                }}
              >
                <i className="ri-file-pdf-line" style={{ fontSize: 22, color: "#fff" }}></i>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.06em", lineHeight: 1 }}>PDF</span>
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "2px dashed #b1005d",
                  borderLeft: "none",
                  borderRadius: "0 12px 12px 0",
                  padding: "18px 20px",
                  background: "#fdf5f8",
                  cursor: "pointer",
                  transition: "0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6e0431"; e.currentTarget.style.background = "#f8e8f0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#b1005d"; e.currentTarget.style.background = "#fdf5f8"; }}
              >
                <i className="ri-upload-cloud-2-line" style={{ fontSize: 24, color: "#b1005d" }}></i>
                <span style={{ fontSize: 15, color: "#6e0431", fontWeight: 700 }}>{t.attach}</span>
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                <i className="ri-error-warning-line" style={{ fontSize: 14, color: "#b1005d", marginTop: 1, flexShrink: 0 }}></i>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#b1005d", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!canStart}
            style={{
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 16,
              cursor: canStart ? "pointer" : "not-allowed",
              border: "none",
              borderRadius: 11,
              padding: "14px 32px",
              background: canStart ? "#b1005d" : "#e0d5d8",
              color: canStart ? "#fff" : "#a08890",
              transition: "0.15s",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => { if (canStart) e.currentTarget.style.background = "#8f0f48"; }}
            onMouseLeave={(e) => { if (canStart) e.currentTarget.style.background = "#b1005d"; }}
          >
            {t.send}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes drawTraj { to { stroke-dashoffset: 0 } }
      `}</style>
    </div>
  );
}