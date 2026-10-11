import { useState } from "react";
import type { RoadmapData } from "./roadmapTypes";
import SurveyModal from "./SurveyModal";
import { downloadRoadmapPdf } from "@/utils/generateRoadmapPdf";
import RoadmapTopBar from "./RoadmapTopBar";
import RoadmapHeader from "./RoadmapHeader";
import RoadmapIndicators from "./RoadmapIndicators";
import RoadmapProfile from "./RoadmapProfile";
import RoadmapElevation from "./RoadmapElevation";
import RoadmapDecisionPlane from "./RoadmapDecisionPlane";
import RoadmapObjectiveCard from "./RoadmapObjectiveCard";
import RoadmapSevenDays from "./RoadmapSevenDays";
import RoadmapChecks from "./RoadmapChecks";

interface RoadmapStageProps {
  lang: "en" | "es";
  roadmap: RoadmapData;
  employeeName: string;
  employeeId: number | null;
  userId: string | null;
  onNewSession: () => void;
}

const copy = {
  en: {
    new_session: "Start a new session",
    survey_button: "Fill out survey",
    download_pdf: "Download PDF",
    footer: "Cogniflow · Generated roadmap",
    invalid_data_title: "Roadmap data is incomplete",
    invalid_data_desc: "The loaded roadmap is missing objectives or profile data. Try starting a new session.",
  },
  es: {
    new_session: "Iniciar nueva sesión",
    survey_button: "Responder cuestionario",
    download_pdf: "Descargar PDF",
    footer: "Cogniflow · Roadmap generado",
    invalid_data_title: "Los datos del roadmap están incompletos",
    invalid_data_desc: "El roadmap cargado no tiene objetivos o datos de perfil. Intenta iniciar una nueva sesión.",
  },
};

export default function RoadmapStage({
  lang,
  roadmap,
  employeeName,
  employeeId,
  userId,
  onNewSession,
}: RoadmapStageProps) {
  const t = copy[lang];
  const [showSurvey, setShowSurvey] = useState(false);
  const [mode, setMode] = useState<"datos" | "narrativa">("datos");

  // Validate data before rendering
  const isValid =
    roadmap &&
    Array.isArray(roadmap.objectives) &&
    roadmap.objectives.length > 0;

  if (!isValid) {
    return (
      <div
        style={{
          fontFamily: "'Open Sans','Segoe UI',Roboto,system-ui,sans-serif",
          fontSize: 15,
          lineHeight: 1.5,
          color: "#3d3d3d",
          background: "#faf7f8",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #d9d2cf",
            borderRadius: 16,
            padding: "40px 32px",
            maxWidth: 480,
            textAlign: "center",
            boxShadow:
              "0 1px 2px rgba(61,61,61,.06), 0 6px 18px -10px rgba(110,4,49,.18)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#f3e8ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <i
              className="ri-error-warning-line"
              style={{ fontSize: 28, color: "#b1005d" }}
            ></i>
          </div>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#6e0431",
              marginBottom: 8,
            }}
          >
            {t.invalid_data_title}
          </h3>
          <p style={{ fontSize: 14, color: "#867b77", lineHeight: 1.6, marginBottom: 20 }}>
            {t.invalid_data_desc}
          </p>
          <button
            onClick={onNewSession}
            style={{
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              background: "#b1005d",
              color: "#fff",
              whiteSpace: "nowrap",
              transition: "0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <i className="ri-refresh-line" style={{ marginRight: 6 }}></i>
            {t.new_session}
          </button>
        </div>
      </div>
    );
  }

  const profileName =
    roadmap.reader_profile?.display_name ||
    employeeName?.split(" ")[0] ||
    "";
  const topMeta = profileName
    ? `${lang === "es" ? "Para" : "For"} ${profileName}`
    : undefined;

  const handleDownloadPdf = () => {
    downloadRoadmapPdf({
      employeeName: employeeName || profileName || "",
      roadmapSummary: roadmap.roadmap_summary || "",
      objectives: roadmap.objectives,
      lang,
    });
  };

  return (
    <div
      style={{
        fontFamily: "'Open Sans','Segoe UI',Roboto,system-ui,sans-serif",
        fontSize: 15,
        lineHeight: 1.5,
        color: "#3d3d3d",
        background: "#faf7f8",
      }}
    >
      {/* Top bar standalone strip (separate from the page header) */}
      <RoadmapTopBar lang={lang} topMeta={topMeta} />

      {/* Main wrap */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "28px 24px 80px",
        }}
      >
        {/* Action buttons row — visible at the top for quick access */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <button
            onClick={handleDownloadPdf}
            style={{
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              border: "2px solid #8f0f48",
              borderRadius: 6,
              padding: "9px 20px",
              background: "#fff",
              color: "#8f0f48",
              whiteSpace: "nowrap",
              transition: "0.15s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f3e8ee"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
          >
            <i className="ri-download-2-line"></i>
            {t.download_pdf}
          </button>
          <button
            onClick={() => setShowSurvey(true)}
            style={{
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              border: "2px solid #752b8c",
              borderRadius: 6,
              padding: "9px 20px",
              background: "#fff",
              color: "#752b8c",
              whiteSpace: "nowrap",
              transition: "0.15s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f3e8ee"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
          >
            <i className="ri-survey-line"></i>
            {t.survey_button}
          </button>
          <button
            onClick={onNewSession}
            style={{
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              border: "none",
              borderRadius: 6,
              padding: "10px 22px",
              background: "#b1005d",
              color: "#fff",
              whiteSpace: "nowrap",
              transition: "0.15s",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <i className="ri-refresh-line"></i>
            {t.new_session}
          </button>
        </div>

        {/* Page head — headline + narrative toggle */}
        <RoadmapHeader
          lang={lang}
          data={roadmap}
          mode={mode}
          onModeChange={setMode}
        />

        {/* KPI indicators */}
        <RoadmapIndicators data={roadmap} lang={lang} />

        {/* Profile panel */}
        <RoadmapProfile data={roadmap} lang={lang} />

        {/* Elevation profile */}
        <RoadmapElevation data={roadmap} lang={lang} />

        {/* Decision plane + score table */}
        <RoadmapDecisionPlane data={roadmap} lang={lang} />

        {/* Objective cards */}
        <section
          style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}
          aria-label={lang === "es" ? "Objetivos" : "Objectives"}
        >
          {roadmap.objectives.map((obj) => (
            <RoadmapObjectiveCard
              key={obj.order}
              obj={obj}
              lang={lang}
              mode={mode}
            />
          ))}
        </section>

        {/* First 7 days */}
        <RoadmapSevenDays data={roadmap} lang={lang} />

        {/* Integrity checks */}
        <RoadmapChecks data={roadmap} lang={lang} />

        {/* Footer note */}
        <footer
          style={{
            borderTop: "1px solid #d9d2cf",
            paddingTop: 16,
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 13,
            color: "#867b77",
          }}
        >
          <span>{t.footer}</span>
          {roadmap.generated_at && (
            <span
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: 12,
              }}
            >
              {roadmap.generated_at}
            </span>
          )}
        </footer>
      </div>

      {/* Survey modal */}
      <SurveyModal
        open={showSurvey}
        onClose={() => setShowSurvey(false)}
        employeeId={employeeId}
        userId={userId}
        lang={lang}
      />
    </div>
  );
}