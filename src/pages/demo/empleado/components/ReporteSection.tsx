import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { downloadReportPdf } from "@/utils/generateReportPdf";

interface TensionSource {
  tension_id?: string;
  tension_name?: string;
  tension_type?: string;
  facets?: string[];
}

interface LeverSource {
  lever_id?: string;
  window_facet?: string;
  is_lead_window?: boolean;
  acts_on_facets?: string[];
  adjustment_direction?: string;
}

interface Question {
  number: number;
  question_text: string;
  tension_source: TensionSource | null;
  lever_source: LeverSource | null;
  type_note: string;
  chart_ref: string;
  confidence_tier?: string;
}

interface ReporteData {
  id: number;
  profile_name: string | null;
  mbti_type: string | null;
  profile_summary: string | null;
  questions: Question[] | null;
  one_thing_worth_noticing: string | null;
  coaching_note: string | null;
  fecha_aplicacion: string;
  tipo_reportado: string | null;
}

interface ReporteSectionProps {
  employeeId?: number;
}

const CONFIDENCE_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  high: { bg: "#ECFDF5", dot: "#10B981", text: "#065F46" },
  moderate: { bg: "#FFFBEB", dot: "#F59E0B", text: "#92400E" },
  low: { bg: "#FEF2F2", dot: "#EF4444", text: "#991B1B" },
};

const CHART_LABELS: Record<string, string> = {
  ei: "E-I",
  sn: "S-N",
  tf: "T-F",
  jp: "J-P",
};

export default function ReporteSection({ employeeId }: ReporteSectionProps) {
  const { t } = useTranslation();
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: reportes, error: rError } = await supabase
        .from("reportes")
        .select("*")
        .eq("usuario_id", employeeId)
        .order("fecha_aplicacion", { ascending: false })
        .limit(1);

      if (rError) {
        setError(t("report.load_error"));
        setLoading(false);
        return;
      }

      if (!reportes || reportes.length === 0) {
        setError(t("report.not_available_desc"));
        setLoading(false);
        return;
      }

      const rep = reportes[0];

      if (!rep.profile_summary && !rep.questions) {
        setError(t("report.no_guide"));
        setLoading(false);
        return;
      }

      setReporte({
        id: rep.id,
        profile_name: rep.profile_name,
        mbti_type: rep.mbti_type,
        profile_summary: rep.profile_summary,
        questions: rep.questions as Question[] | null,
        one_thing_worth_noticing: rep.one_thing_worth_noticing,
        coaching_note: rep.coaching_note,
        fecha_aplicacion: rep.fecha_aplicacion,
        tipo_reportado: rep.tipo_reportado,
      });
      setLoading(false);
    };

    load();
  }, [employeeId, t]);

  const getConfidenceInfo = (tier?: string) => {
    return CONFIDENCE_COLORS[tier || ""] || CONFIDENCE_COLORS.moderate;
  };

  const formatSource = (q: Question): string => {
    if (q.lever_source) {
      const actsOn = q.lever_source.acts_on_facets || [];
      const window = q.lever_source.window_facet || "";
      return actsOn.length > 0
        ? `${window} · growth lever — acts on: ${actsOn.join(", ")}`
        : `${window} · growth lever`;
    }
    if (q.tension_source) {
      const facets = q.tension_source.facets || [];
      const name = q.tension_source.tension_name || "";
      return facets.length > 0
        ? `${name} — ${facets.join(", ")}`
        : name;
    }
    return "—";
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: "#EDE9FE" }}>
          <i className="ri-file-text-line text-lg" style={{ color: "#7C3AED" }}></i>
        </div>
        <p className="text-sm text-gray-400 mt-3">{t("report.loading")}</p>
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white px-8 text-center"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#FEF3C7" }}>
          <i className="ri-file-search-line text-2xl" style={{ color: "#D97706" }}></i>
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">{t("report.not_available")}</p>
        <p className="text-sm text-gray-400 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="rounded-3xl bg-white p-6 md:p-8" style={{ border: "1px solid #F3F4F6" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {t("report.companion_guide")}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
              {reporte.profile_name || reporte.tipo_reportado || t("report.your_profile")}
            </h2>
            {reporte.mbti_type && (
              <p className="text-sm mt-1" style={{ color: "#7C3AED" }}>
                {reporte.mbti_type}
              </p>
            )}
          </div>
          <button
            onClick={() =>
              downloadReportPdf({
                profile_name: reporte.profile_name || reporte.tipo_reportado || t("report.your_profile"),
                mbti_type: reporte.mbti_type,
                profile_summary: reporte.profile_summary,
                questions: reporte.questions,
                one_thing_worth_noticing: reporte.one_thing_worth_noticing,
                coaching_note: reporte.coaching_note,
                fecha_aplicacion: reporte.fecha_aplicacion,
                tipo_reportado: reporte.tipo_reportado,
              })
            }
            className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
            style={{
              backgroundColor: "#1B2A4A",
              color: "#C8922A",
              border: "1px solid #C8922A",
            }}
          >
            <i className="ri-download-line"></i>
            {t("report.download_pdf")}
          </button>
        </div>

        {/* Profile Summary */}
        {reporte.profile_summary && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FDF8EC", borderLeft: "4px solid #C8922A" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#C8922A" }}>
              {t("report.profile_at_a_glance")}
            </p>
            <p className="text-sm leading-relaxed text-gray-700 italic">
              {reporte.profile_summary}
            </p>
          </div>
        )}
      </div>

      {/* Questions */}
      {reporte.questions && reporte.questions.length > 0 && (
        <div className="rounded-3xl bg-white overflow-hidden" style={{ border: "1px solid #F3F4F6" }}>
          <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: "#1B2A4A" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#C8922A" }}>
              <i className="ri-question-answer-line text-white text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-white">{t("report.your_questions")}</p>
              <p className="text-xs text-gray-400">{reporte.questions.length} {t("report.questions_count")}</p>
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-6">
            {reporte.questions.map((q) => {
              const ci = getConfidenceInfo(q.confidence_tier);
              const chartLabel = CHART_LABELS[q.chart_ref] || q.chart_ref;

              return (
                <div
                  key={q.number}
                  className="rounded-2xl p-5 relative"
                  style={{ backgroundColor: "#F7F8FC", borderLeft: "4px solid #C8922A" }}
                >
                  {/* Number badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#C8922A" }}
                    >
                      <span className="text-xs font-bold text-white">{q.number}</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {t("report.question_number")} {q.number}
                    </span>
                    {/* Confidence tier */}
                    <div
                      className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: ci.bg, color: ci.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ci.dot }}></span>
                      {q.confidence_tier || "moderate"}
                    </div>
                  </div>

                  {/* Question text */}
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed mb-3 italic">
                    &ldquo;{q.question_text}&rdquo;
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-bar-chart-grouped-line"></i>
                      <span>Chart: <strong>{chartLabel}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ri-lightbulb-line"></i>
                      <span>{q.type_note}</span>
                    </div>
                  </div>

                  {/* Source */}
                  <p className="text-xs text-gray-400 mt-2">
                    {formatSource(q)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* One Thing Worth Noticing */}
      {reporte.one_thing_worth_noticing && (
        <div className="rounded-3xl bg-white p-6 md:p-8" style={{ border: "1px solid #F3F4F6" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EDE9FE" }}>
              <i className="ri-eye-line text-base" style={{ color: "#7C3AED" }}></i>
            </div>
            <h3 className="text-base font-bold text-black">{t("report.something_worth_noticing")}</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">
            {reporte.one_thing_worth_noticing}
          </p>
        </div>
      )}

      {/* Coaching Note */}
      {reporte.coaching_note && (
        <div className="rounded-3xl bg-white p-6 md:p-8" style={{ border: "1px solid #F3F4F6" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#D1FAE5" }}>
              <i className="ri-user-heart-line text-base" style={{ color: "#059669" }}></i>
            </div>
            <h3 className="text-base font-bold text-black">{t("report.working_with_coach")}</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">
            {t("report.coaching_note_prefix")}
            {" "}{reporte.coaching_note}
          </p>
        </div>
      )}
    </div>
  );
}