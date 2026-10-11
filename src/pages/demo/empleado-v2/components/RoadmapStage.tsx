import { useState } from "react";
import type { RoadmapData, RoadmapObjective } from "./ChatStage";
import SurveyModal from "./SurveyModal";
import { downloadRoadmapPdf } from "@/utils/generateRoadmapPdf";

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
    title: "Your roadmap to the summit",
    subtitle: "Cogniflow mapped the path based on this session. Each peak is an objective to reach.",
    summit: "SUMMIT",
    mountain_types: {
      "Quick Win": "Quick Win",
      "The Summit": "The Summit",
    },
    path_types: {
      "Path A: User-Expressed Problem": "From your needs",
      "Path B: Corporate Matrix Variable": "From your context",
    },
    new_session: "Start a new session",
    scroll_hint: "Hover or tap each peak to see details",
    objective_label: "Objective",
    justification_label: "Why this matters",
    survey_button: "Fill out survey",
    download_pdf: "Download PDF",
  },
  es: {
    title: "Tu roadmap hacia la cima",
    subtitle: "Cogniflow trazó la ruta con base en esta sesión. Cada cumbre es un objetivo a alcanzar.",
    summit: "CIMA",
    mountain_types: {
      "Quick Win": "Victoria Rápida",
      "The Summit": "La Cumbre",
    },
    path_types: {
      "Path A: User-Expressed Problem": "Desde tus necesidades",
      "Path B: Corporate Matrix Variable": "Desde tu contexto",
    },
    new_session: "Iniciar nueva sesión",
    scroll_hint: "Pasa el cursor o toca cada cumbre para ver detalles",
    objective_label: "Objetivo",
    justification_label: "Por qué es importante",
    survey_button: "Responder cuestionario",
    download_pdf: "Descargar PDF",
  },
};

const PEAK_COLORS = ["#b1005d", "#752b8c", "#6e0431", "#f5802c"];

// Peak configurations for SVG positioning
// Each peak is a mountain triangle: { peakX, peakY, baseStartX, baseEndX, baseY }
interface PeakConfig {
  peakX: number;
  peakY: number;
  baseStartX: number;
  baseEndX: number;
  baseY: number;
  snowY: number;
  markerX: number;
  markerY: number;
  titleY: number;
}

const peakConfigs: PeakConfig[] = [
  { peakX: 130, peakY: 220, baseStartX: 30, baseEndX: 230, baseY: 310, snowY: 225, markerX: 130, markerY: 208, titleY: 240 },
  { peakX: 290, peakY: 160, baseStartX: 180, baseEndX: 400, baseY: 310, snowY: 166, markerX: 290, markerY: 146, titleY: 178 },
  { peakX: 460, peakY: 100, baseStartX: 340, baseEndX: 570, baseY: 310, snowY: 108, markerX: 460, markerY: 86, titleY: 116 },
  { peakX: 630, peakY: 35, baseStartX: 510, baseEndX: 700, baseY: 310, snowY: 46, markerX: 630, markerY: 22, titleY: 50 },
];

// Generate mountain path with slight curve for organic feel
const mountainPath = (cfg: PeakConfig): string => {
  const leftMidX = (cfg.baseStartX + cfg.peakX) / 2;
  const rightMidX = (cfg.peakX + cfg.baseEndX) / 2;
  return `M${cfg.baseStartX},${cfg.baseY} Q${leftMidX},${(cfg.baseY + cfg.peakY) / 2 + 10} ${cfg.peakX},${cfg.peakY} Q${rightMidX},${(cfg.baseY + cfg.peakY) / 2 + 10} ${cfg.baseEndX},${cfg.baseY}`;
};

const snowPath = (cfg: PeakConfig): string => {
  const w = (cfg.baseEndX - cfg.baseStartX) * 0.09;
  return `M${cfg.peakX - w},${cfg.snowY} Q${cfg.peakX},${cfg.snowY - 12} ${cfg.peakX + w},${cfg.snowY} L${cfg.peakX + w * 0.5},${cfg.peakY + 10} L${cfg.peakX - w * 0.5},${cfg.peakY + 10} Z`;
};

export default function RoadmapStage({ lang, roadmap, employeeName, employeeId, userId, onNewSession }: RoadmapStageProps) {
  const t = copy[lang];
  const [hoveredPeak, setHoveredPeak] = useState<number | null>(null);
  const [selectedPeak, setSelectedPeak] = useState<number | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);

  const handlePeakClick = (index: number) => {
    setSelectedPeak((prev) => (prev === index ? null : index));
  };

  const handleDownloadPdf = () => {
    downloadRoadmapPdf({
      employeeName: employeeName || "",
      roadmapSummary: roadmap.roadmap_summary,
      objectives: roadmap.objectives,
      lang,
    });
  };

  const activeObj: RoadmapObjective | null = selectedPeak !== null ? roadmap.objectives[selectedPeak] : null;
  const hoveredObj: RoadmapObjective | null = hoveredPeak !== null ? roadmap.objectives[hoveredPeak] : null;

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#6e0431", marginBottom: 6 }}>
          {t.title}
          {employeeName ? `, ${employeeName.split(" ")[0]}` : ""}
        </h2>
        <p style={{ fontSize: 13, color: "#867b77", maxWidth: 520, margin: "0 auto", lineHeight: 1.5 }}>
          {t.subtitle}
        </p>
        {/* Roadmap summary */}
        {roadmap.roadmap_summary && (
          <div
            style={{
              background: "#f3e8ee",
              borderRadius: 11,
              padding: "14px 18px",
              marginTop: 14,
              maxWidth: 600,
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: 13,
              color: "#3d3d3d",
              lineHeight: 1.65,
              textAlign: "left",
            }}
          >
            {roadmap.roadmap_summary}
          </div>
        )}
      </div>

      {/* Mountain visualization */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #4a1b6b 0%, #752b8c 35%, #8f0f48 100%)",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(110,4,49,0.25)",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        {/* Summit badge */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 18,
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 10,
          }}
        >
          <span style={{ color: "#f5802c", fontSize: 20, lineHeight: 1 }}>◆</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: "0.12em" }}>{t.summit}</span>
        </div>

        {/* Scroll hint */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(6px)",
            borderRadius: 20,
            padding: "8px 18px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "bounceHint 2s ease-in-out infinite",
          }}
        >
          <i className="ri-cursor-line" style={{ color: "#fff", fontSize: 15, opacity: 0.9 }}></i>
          <span
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {t.scroll_hint}
          </span>
        </div>

        {/* SVG Mountain */}
        <svg viewBox="0 0 720 320" style={{ width: "100%", height: "auto", display: "block" }}>
          {/* Sky gradient overlay */}
          <defs>
            <radialGradient id="skyGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="#f5802c" />
            </linearGradient>
          </defs>

          {/* Ambient sky glow */}
          <rect x="0" y="0" width="720" height="320" fill="url(#skyGlow)" />

          {/* Stars / particles */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <circle
              key={i}
              cx={70 + i * 90 + (i % 3) * 20}
              cy={30 + (i * 47) % 90}
              r={1 + (i % 2)}
              fill="rgba(255,255,255,0.5)"
              style={{ animation: `twinkle ${2 + (i % 3)}s ${i * 0.4}s ease-in-out infinite` }}
            />
          ))}

          {/* Background mountains (darker, lower) */}
          <path
            d="M0,320 L0,260 L80,240 L160,255 L250,220 L350,240 L420,200 L520,230 L600,190 L680,210 L720,195 L720,320 Z"
            fill="rgba(0,0,0,0.25)"
          />

          {/* Main 4 peaks */}
          {peakConfigs.map((cfg, i) => (
            <g key={i}>
              {/* Mountain body */}
              <path
                d={mountainPath(cfg)}
                fill={PEAK_COLORS[i]}
                opacity="0.85"
              />
              {/* Mountain highlight (left side) */}
              <path
                d={`M${cfg.baseStartX},${cfg.baseY} Q${(cfg.baseStartX + cfg.peakX) / 2},${(cfg.baseY + cfg.peakY) / 2 + 10} ${cfg.peakX},${cfg.peakY}`}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
              />

              {/* Snow cap */}
              <path
                d={snowPath(cfg)}
                fill="rgba(255,255,255,0.92)"
              />

              {/* Peak marker (interactive circle) */}
              <g
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredPeak(i)}
                onMouseLeave={() => setHoveredPeak(null)}
                onClick={() => handlePeakClick(i)}
              >
                {/* Glow ring */}
                <circle
                  cx={cfg.markerX}
                  cy={cfg.markerY}
                  r="18"
                  fill="none"
                  stroke={PEAK_COLORS[i]}
                  strokeWidth="2"
                  opacity={selectedPeak === i || hoveredPeak === i ? "0.8" : "0.35"}
                  style={{ transition: "opacity 0.25s" }}
                />
                {/* Outer pulse when active */}
                {selectedPeak === i && (
                  <circle
                    cx={cfg.markerX}
                    cy={cfg.markerY}
                    r="22"
                    fill="none"
                    stroke={PEAK_COLORS[i]}
                    strokeWidth="1.5"
                    opacity="0.4"
                    style={{ animation: "pulseRing 2s ease infinite" }}
                  />
                )}
                {/* Main circle */}
                <circle
                  cx={cfg.markerX}
                  cy={cfg.markerY}
                  r="12"
                  fill={PEAK_COLORS[i]}
                  stroke="#fff"
                  strokeWidth="2.5"
                />
                {/* Number */}
                <text
                  x={cfg.markerX}
                  y={cfg.markerY + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#fff"
                  style={{ pointerEvents: "none" }}
                >
                  {i + 1}
                </text>
              </g>

              {/* Title below peak */}
              <text
                x={cfg.markerX}
                y={cfg.titleY + 24}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="700"
                fill="rgba(255,255,255,0.9)"
                style={{ pointerEvents: "none" }}
              >
                {roadmap.objectives[i]?.title.length > 38
                  ? roadmap.objectives[i].title.slice(0, 38) + "…"
                  : roadmap.objectives[i]?.title}
              </text>
            </g>
          ))}

          {/* Dotted road connecting peaks */}
          <path
            d={`M${peakConfigs[0].markerX},${peakConfigs[0].markerY} Q210,175 ${peakConfigs[1].markerX},${peakConfigs[1].markerY} Q375,130 ${peakConfigs[2].markerX},${peakConfigs[2].markerY} Q545,60 ${peakConfigs[3].markerX},${peakConfigs[3].markerY}`}
            fill="none"
            stroke="url(#roadGrad)"
            strokeWidth="2.5"
            strokeDasharray="5 9"
            strokeLinecap="round"
            style={{ animation: "drawRoad 3s 0.6s ease both", strokeDashoffset: 600, strokeDasharray: 600 }}
          />

          {/* Base ground line */}
          <line x1="0" y1="310" x2="720" y2="310" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
      </div>

      {/* Peak detail card — shown on click (pinned) or hover (temporary) */}
      {(() => {
        const isClick = selectedPeak !== null;
        const peakIdx = isClick ? selectedPeak! : hoveredPeak;
        const obj = isClick ? activeObj : hoveredObj;
        if (peakIdx === null || !obj) return null;
        return (
        <div
          style={{
            background: isClick ? "#fff" : "#faf6f8",
            border: isClick ? "1px solid #d9d2cf" : "1.5px dashed #d4c0ca",
            borderRadius: 14,
            padding: "18px 20px",
            marginTop: 18,
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: isClick ? "0 2px 16px rgba(110,4,49,0.1)" : "none",
            animation: "riseIn 0.3s ease both",
            transition: "all 0.2s",
          }}
        >
          {/* Peak indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: PEAK_COLORS[peakIdx],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{peakIdx + 1}</span>
            </div>
            <div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: PEAK_COLORS[peakIdx],
                }}
              >
                {t.mountain_types[obj.mountain_type as keyof typeof t.mountain_types] || obj.mountain_type}
              </span>
              <span style={{ color: "#867b77", fontSize: 10, marginLeft: 8 }}>
                {t.path_types[obj.path_type as keyof typeof t.path_types] || obj.path_type}
              </span>
              {!isClick && (
                <span style={{ color: "#b1005d", fontSize: 10, marginLeft: 8, fontStyle: "italic" }}>
                  — {lang === "es" ? "haz clic para fijar" : "click to pin"}
                </span>
              )}
            </div>
          </div>

          {/* Objective title */}
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#3d3d3d", lineHeight: 1.4, marginBottom: 8 }}>
            {obj.title}
          </h4>

          {/* Justification */}
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#867b77", flexShrink: 0 }}>
              {t.justification_label}:
            </span>
            <p style={{ fontSize: 12, color: "#5c504e", lineHeight: 1.6 }}>
              {obj.justification}
            </p>
          </div>
        </div>
        );
      })()}

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <button
          onClick={handleDownloadPdf}
          style={{
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            border: "2px solid #8f0f48",
            borderRadius: 11,
            padding: "13px 28px",
            background: "#fff",
            color: "#8f0f48",
            whiteSpace: "nowrap",
            transition: "0.15s",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f3e8ee"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
        >
          <i className="ri-download-2-line" style={{ marginRight: 6 }}></i>
          {t.download_pdf}
        </button>
        <button
          onClick={() => setShowSurvey(true)}
          style={{
            fontFamily: "inherit",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            border: "2px solid #752b8c",
            borderRadius: 11,
            padding: "13px 28px",
            background: "#fff",
            color: "#752b8c",
            whiteSpace: "nowrap",
            transition: "0.15s",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#f3e8ee"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
        >
          <i className="ri-survey-line" style={{ marginRight: 6 }}></i>
          {t.survey_button}
        </button>
        <button
          onClick={onNewSession}
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
            whiteSpace: "nowrap",
            transition: "0.15s",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {t.new_session}
        </button>
      </div>

      {/* Survey modal */}
      <SurveyModal
        open={showSurvey}
        onClose={() => setShowSurvey(false)}
        employeeId={employeeId}
        userId={userId}
        lang={lang}
      />

      <style>{`
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes drawRoad { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
        @keyframes twinkle { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(177,0,93,0.4) } 50% { box-shadow: 0 0 0 8px rgba(177,0,93,0) } }
        @keyframes bounceHint { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-4px); } }
      `}</style>
    </div>
  );
}