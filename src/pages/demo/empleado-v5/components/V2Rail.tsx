import { useEffect, useRef } from "react";
import type { V2Stage } from "../page";

interface V2RailProps {
  currentStage: V2Stage;
  lang: "en" | "es";
}

const STAGES: V2Stage[] = ["upload", "values", "processing", "question", "chat", "roadmap"];

const LABELS: Record<V2Stage, Record<"en" | "es", string>> = {
  upload: { en: "Upload", es: "Subir" },
  values: { en: "Values", es: "Valores" },
  processing: { en: "Processing", es: "Proceso" },
  question: { en: "Question", es: "Pregunta" },
  chat: { en: "Climb", es: "Ascenso" },
  roadmap: { en: "Roadmap", es: "Roadmap" },
};

// Progress fractions for each stage (based on evenly-spaced path nodes at x: 0,156,312,468,624,780)
const FRACS: Record<V2Stage, number> = {
  upload: 0,
  values: 0.20,
  processing: 0.40,
  question: 0.60,
  chat: 0.80,
  roadmap: 1,
};

export default function V2Rail({ currentStage, lang }: V2RailProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!fillRef.current || !pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    fillRef.current.style.strokeDasharray = String(len);
    fillRef.current.style.strokeDashoffset = String(len * (1 - FRACS[currentStage]));
  }, [currentStage]);

  const stageIndex = STAGES.indexOf(currentStage);

  return (
    <div
      style={{
        position: "sticky",
        top: 45,
        zIndex: 39,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #d9d2cf",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "4px 28px 0" }}>
        <div style={{ position: "relative", height: 52, marginTop: 2 }}>
          <svg
            viewBox="0 0 800 46"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 30 }}
          >
            <path
              ref={pathRef}
              d="M0,24 L156,18 L312,14 L468,10 L624,7 L780,5"
              fill="none"
              stroke="#d9d2cf"
              strokeWidth={2.5}
            />
            <path
              ref={fillRef}
              d="M0,24 L156,18 L312,14 L468,10 L624,7 L780,5"
              fill="none"
              stroke="#b1005d"
              strokeWidth={2.5}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.3,.6,.3,1)" }}
            />
            {[0, 156, 312, 468, 624, 780].map((cx, i) => (
              <circle
                key={cx}
                cx={cx}
                cy={[24, 18, 14, 10, 7, 5][i]}
                r={3.5}
                fill={i < stageIndex ? "#b1005d" : "#d9d2cf"}
                style={{ transition: "fill 0.4s" }}
              />
            ))}
          </svg>

          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            {STAGES.map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: s === currentStage ? "#8f0f48" : "#867b77",
                  transition: "color 0.3s",
                }}
              >
                {LABELS[s][lang]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}