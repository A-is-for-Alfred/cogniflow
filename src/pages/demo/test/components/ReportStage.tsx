import { useTranslation } from "react-i18next";
import { useMemo, useRef } from "react";
import {
  FACETS,
  DICHOTOMIES,
  APPLIED_TABLES,
  FUNCTION_NAMES,
  DECISION_QUESTIONS,
  type TestResult,
  type FacetResult,
  type FacetDef,
  type DichotomyDef,
} from "../data";
import { type FacetResult as FacetResultType } from "../page";

interface ReportStageProps {
  lang: string;
  results: TestResult;
  answers: (number | null)[];
  onRestart: () => void;
}

function getFacetDef(facetId: number): FacetDef {
  return FACETS.find((f) => f.id === facetId)!;
}

function getDichDef(code: string): DichotomyDef {
  return DICHOTOMIES.find((d) => d.code === code)!;
}

function FacetTrack({ facet, result, lang }: { facet: FacetDef; result: FacetResult; lang: string }) {
  const pct = ((result.score + 5) / 10) * 100;
  const dich = getDichDef(facet.dich);
  const leftLabel = lang === "es" ? facet.leftNameES : facet.leftNameEN;
  const rightLabel = lang === "es" ? facet.rightNameES : facet.rightNameEN;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">F{facet.id}</span>
          <span className="text-sm font-semibold text-gray-800">
            {lang === "es" ? facet.themeES : facet.themeEN}
          </span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            result.category === "in_preference"
              ? "bg-green-100 text-green-700"
              : result.category === "out_preference"
              ? "bg-rose-100 text-rose-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {result.category === "in_preference"
            ? "test.facet_cat_in"
            : result.category === "out_preference"
            ? "test.facet_cat_out"
            : "test.facet_cat_low"}
        </span>
      </div>

      <div className="relative h-8 mb-2">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full overflow-hidden flex">
          <div className="flex-1 h-full" style={{ backgroundColor: "#0E5C63" }} />
          <div className="flex-1 h-full" style={{ backgroundColor: "#8C3F5D" }} />
        </div>
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
        {/* Needle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all"
          style={{ left: `calc(${pct}% - 8px)`, backgroundColor: "#14211F" }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{leftLabel} ({dich.leftLetter})</span>
        <span className="font-mono text-gray-800">{result.absScore}/5</span>
        <span>{rightLabel} ({dich.rightLetter})</span>
      </div>
    </div>
  );
}

export default function ReportStage({ lang, results, answers, onRestart }: ReportStageProps) {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);

  const { type, dichotomies, facets, polarity, outOfPreference, decisionStyle, functionDynamics } = results;

  const unansweredCount = useMemo(() => answers.filter((a) => a === null).length, [answers]);

  const handlePrint = () => {
    window.print();
  };

  const handleRawData = () => {
    const raw = {
      type,
      dichotomies,
      facets,
      polarity,
      outOfPreference,
      answers,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `perfil-tipologico-${type.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pciLevelText = (level: string) => {
    switch (level) {
      case "level_undefined": return t("test.report.level_undefined");
      case "level_light": return t("test.report.level_light");
      case "level_moderate": return t("test.report.level_moderate");
      case "level_clear": return t("test.report.level_clear");
      case "level_very_clear": return t("test.report.level_very_clear");
      default: return level;
    }
  };

  const dichColors: Record<string, string> = {
    EI: "#0E5C63",
    SN: "#A87A22",
    TF: "#8C3F5D",
    JP: "#4F46E5",
  };

  const polarityNote = polarity < 45
    ? (lang === "es" ? "Tu perfil muestra baja consistencia. Puede deberse al uso frecuente de la opción central." : "Your profile shows low consistency. It may be due to frequent use of the neutral option.")
    : polarity > 65
    ? (lang === "es" ? "Tu perfil es muy consistente, con preferencias bien definidas." : "Your profile is very consistent, with well-defined preferences.")
    : (lang === "es" ? "Tu perfil tiene consistencia típica para adultos." : "Your profile has typical consistency for adults.");

  return (
    <div ref={reportRef} className="space-y-8 pb-12">
      {/* Title + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            {t("test.report.title")}
          </h1>
          {unansweredCount > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              {lang === "es" ? `${unansweredCount} ítems sin responder (contados como neutros)` : `${unansweredCount} unanswered items (counted as neutral)`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-all whitespace-nowrap"
          >
            <i className="ri-printer-line"></i>
            {t("test.download_pdf")}
          </button>
          <button
            onClick={handleRawData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-all whitespace-nowrap"
          >
            <i className="ri-download-cloud-line"></i>
            {t("test.raw_data")}
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: "#7C3AED" }}
          >
            <i className="ri-restart-line"></i>
            {t("test.restart")}
          </button>
        </div>
      </div>

      {/* Type banner */}
      <div
        className="rounded-2xl p-6 md:p-10 text-center"
        style={{ backgroundColor: "#14211F" }}
      >
        <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
          {t("test.report.type")}
        </p>
        <div className="flex justify-center gap-2 md:gap-3 mb-4">
          {type.split("").map((letter, i) => {
            const dich = dichotomies[i];
            const color = dichColors[dich.code] || "#7C3AED";
            return (
              <div
                key={i}
                className="w-14 h-14 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl md:text-4xl font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {letter}
              </div>
            );
          })}
        </div>
        {outOfPreference.length > 0 && (
          <p className="text-sm text-white/70">
            {t("test.report.individualized_type")}: <span className="text-white font-semibold">{type}</span>
            {" "}+{" "}
            {outOfPreference
              .map((fid) => {
                const f = getFacetDef(fid);
                return lang === "es" ? f.leftNameES : f.leftNameEN;
              })
              .join(", ")}
          </p>
        )}
      </div>

      {/* PCI + Polarity cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PCI */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {t("test.report.clarity")}
          </h2>
          <div className="space-y-4">
            {dichotomies.map((dich) => {
              const def = getDichDef(dich.code);
              const color = dichColors[dich.code] || "#7C3AED";
              const leftName = lang === "es" ? def.leftNameES : def.leftNameEN;
              const rightName = lang === "es" ? def.rightNameES : def.rightNameEN;
              const pct = (dich.pci / 30) * 100;
              return (
                <div key={dich.code}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">
                      {leftName} — {rightName}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                      {dich.letter} · PCI {dich.pci}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pciLevelText(dich.pciLevel)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Polarity */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {t("test.report.polarity")}
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: polarity < 45 ? "#EF4444" : polarity > 65 ? "#059669" : "#F59E0B" }}
            >
              {polarity}
            </div>
            <div>
              <p className="text-sm text-gray-600">{polarityNote}</p>
              <p className="text-xs text-gray-400 mt-1">{t("test.report.polarity_note")}</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${polarity}%`, backgroundColor: polarity < 45 ? "#EF4444" : polarity > 65 ? "#059669" : "#F59E0B" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>0</span>
            <span>45</span>
            <span>65</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Decision style */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          {t("test.report.decision_style")}
        </h2>
        <p className="text-base font-semibold text-gray-800 mb-2">
          {lang === "es" ? decisionStyle.nameES : decisionStyle.nameEN}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {lang === "es" ? decisionStyle.descES : decisionStyle.descEN}
        </p>
      </div>

      {/* Function dynamics */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          {t("test.report.function_dynamics")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "dominant", label: t("test.report.dominant"), func: functionDynamics.dominant },
            { key: "auxiliary", label: t("test.report.auxiliary"), func: functionDynamics.auxiliary },
            { key: "tertiary", label: t("test.report.tertiary"), func: functionDynamics.tertiary },
            { key: "inferior", label: t("test.report.inferior"), func: functionDynamics.inferior },
          ].map((role, i) => {
            const fnInfo = FUNCTION_NAMES[role.func];
            return (
              <div key={role.key} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{role.label}</p>
                <p className="text-xl font-bold text-gray-900 mb-1">{role.func}</p>
                {fnInfo && (
                  <>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {lang === "es" ? fnInfo.nameES : fnInfo.nameEN}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {lang === "es" ? fnInfo.descES : fnInfo.descEN}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision questions */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          {t("test.report.decision_questions")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DECISION_QUESTIONS.map((dq) => {
            // Mark questions relevant to the profile
            const f11 = facets.find((f) => f.facetId === 11)!;
            const f12 = facets.find((f) => f.facetId === 12)!;
            const pole11 = f11.absScore >= 2 ? (f11.pole === "left" ? "L" : "R") : "M";
            const pole12 = f12.absScore >= 2 ? (f12.pole === "left" ? "L" : "R") : "M";
            const isRelevant = dq.pole === "both" ||
              (dq.pole === "L" && (pole11 === "L" || pole12 === "L")) ||
              (dq.pole === "R" && (pole11 === "R" || pole12 === "R"));
            return (
              <div
                key={dq.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isRelevant ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isRelevant ? "bg-green-500" : "bg-gray-300"
                }`}>
                  <i className={`ri-${isRelevant ? "check" : "close"}-line text-white text-xs`}></i>
                </div>
                <p className={`text-sm ${isRelevant ? "text-gray-800" : "text-gray-400"}`}>
                  {lang === "es" ? dq.textES : dq.textEN}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facet tracks */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          {t("test.report.facet")}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {t("test.report.score")} 0–5 · {t("test.report.raw_score")} 5–25
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FACETS.map((facet) => {
            const result = facets.find((f) => f.facetId === facet.id)!;
            return <FacetTrack key={facet.id} facet={facet} result={result} lang={lang} />;
          })}
        </div>
      </div>

      {/* Out of preference */}
      {outOfPreference.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 md:p-6">
          <h2 className="text-lg font-bold text-rose-900 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {t("test.report.facet_out_title")}
          </h2>
          <p className="text-sm text-rose-700 mb-4">{t("test.report.facet_out_desc")}</p>
          <div className="flex flex-wrap gap-2">
            {outOfPreference.map((fid) => {
              const f = getFacetDef(fid);
              return (
                <span key={fid} className="text-sm font-medium px-3 py-1.5 rounded-full bg-white border border-rose-200 text-rose-800">
                  {lang === "es" ? f.leftNameES : f.leftNameEN}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Applied tables */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
          {t("test.report.applied_tables")}
        </h2>
        {APPLIED_TABLES.map((table) => (
          <AppliedTableSection key={table.key} table={table} facets={facets} lang={lang} />
        ))}
      </div>

      {/* Print tip */}
      <div className="text-center print:hidden">
        <p className="text-xs text-gray-400">{t("test.print_tip")}</p>
      </div>
    </div>
  );
}

function AppliedTableSection({
  table,
  facets,
  lang,
}: {
  table: typeof APPLIED_TABLES[number];
  facets: FacetResultType[];
  lang: string;
}) {
  const { t } = useTranslation();
  const tableFacets = table.facetIds.map((id) => {
    const def = getFacetDef(id);
    const result = facets.find((f) => f.facetId === id)!;
    return { def, result };
  });

  const tableTitle = lang === "es" ? table.titleES : table.titleEN;
  const tableIntro = lang === "es" ? table.introES : table.introEN;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
      <h3 className="text-base font-bold text-gray-900 mb-2">{tableTitle}</h3>
      <p className="text-sm text-gray-500 mb-4">{tableIntro}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tableFacets.map(({ def, result }) => {
          const poleName = result.pole === "left"
            ? (lang === "es" ? def.leftNameES : def.leftNameEN)
            : (lang === "es" ? def.rightNameES : def.rightNameEN);
          const dich = getDichDef(def.dich);
          const preferred = result.category === "in_preference";
          return (
            <div
              key={def.id}
              className={`p-3 rounded-lg border ${
                preferred ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-gray-400">F{def.id}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    preferred ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {preferred ? "✓" : "—"}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-800">{poleName}</p>
              <p className="text-xs text-gray-400">
                {result.absScore}/5 · {dich.leftLetter}/{dich.rightLetter}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}