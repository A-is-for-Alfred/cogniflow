import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

interface Faceta {
  id: number;
  dimension: string;
  par_nombre: string;
  polo_izquierdo: string;
  polo_derecho: string;
  polo_izquierdo_letra: string;
  polo_derecho_letra: string;
}

interface ResultadoFaceta {
  faceta_id: number;
  score: number;
  polo_resultado: string;
  clasificacion: string;
  is_individualized: boolean;
  cat_facetas: Faceta;
}

interface Reporte {
  id: number;
  tipo_reportado: string;
  individualized_type_label: string | null;
  pci_extraversion: number;
  pci_intuition: number;
  pci_feeling: number;
  pci_perceiving: number;
  polarity_index: number;
  fecha_aplicacion: string;
  resultados_facetas: ResultadoFaceta[];
}

interface FacetasSectionProps {
  employeeId?: number;
}

const DIMENSION_COLORS: Record<string, { bg: string; bar: string; text: string; light: string }> = {
  "Extraversion-Introversion": { bg: "#FEF3C7", bar: "#F59E0B", text: "#92400E", light: "#FFFBEB" },
  "Intuition-Sensing": { bg: "#DBEAFE", bar: "#3B82F6", text: "#1E40AF", light: "#EFF6FF" },
  "Thinking-Feeling": { bg: "#FCE7F3", bar: "#EC4899", text: "#9D174D", light: "#FDF2F8" },
  "Judging-Perceiving": { bg: "#D1FAE5", bar: "#10B981", text: "#065F46", light: "#ECFDF5" },
};

function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function FacetasSection({ employeeId }: FacetasSectionProps) {
  const { t, i18n } = useTranslation();
  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const SCORE_COLORS: Record<string, string> = {
    "in-preference": "#10B981",
    "out-of-preference": "#EF4444",
    midzone: "#9CA3AF",
  };

  const SCORE_LABELS: Record<string, string> = {
    "in-preference": t("facets.in_preference"),
    "out-of-preference": t("facets.out_of_preference"),
    midzone: t("facets.midzone"),
  };

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

      if (rError || !reportes || reportes.length === 0) {
        setError(t("facets.no_report"));
        setLoading(false);
        return;
      }

      const rep = reportes[0];

      const { data: resultados, error: fError } = await supabase
        .from("resultados_facetas")
        .select("*, cat_facetas(*)")
        .eq("reporte_id", rep.id)
        .order("faceta_id", { ascending: true });

      if (fError) {
        setError(t("facets.load_error"));
        setLoading(false);
        return;
      }

      setReporte({
        ...rep,
        resultados_facetas: (resultados || []).map((r: Record<string, unknown>) => ({
          faceta_id: Number(r.faceta_id),
          score: Number(r.score),
          polo_resultado: String(r.polo_resultado),
          clasificacion: String(r.clasificacion),
          is_individualized: Boolean(r.is_individualized),
          cat_facetas: r.cat_facetas as Faceta,
        })),
      });
      setLoading(false);
    };

    load();
  }, [employeeId, t]);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: "#EDE9FE" }}>
          <i className="ri-bar-chart-box-line text-lg" style={{ color: "#7C3AED" }}></i>
        </div>
        <p className="text-sm text-gray-400 mt-3">{t("facets.loading")}</p>
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#F3F4F6" }}>
          <i className="ri-file-chart-line text-xl text-gray-400"></i>
        </div>
        <p className="text-sm text-gray-500 font-medium">{error || t("facets.no_data")}</p>
        <p className="text-xs text-gray-400 mt-1">{t("facets.no_data_desc")}</p>
      </div>
    );
  }

  const grouped = reporte.resultados_facetas.reduce<Record<string, ResultadoFaceta[]>>((acc, r) => {
    const dim = r.cat_facetas.dimension;
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push(r);
    return acc;
  }, {});

  const dimensions = Object.keys(grouped).sort((a, b) => {
    const order = ["Extraversion-Introversion", "Intuition-Sensing", "Thinking-Feeling", "Judging-Perceiving"];
    return order.indexOf(a) - order.indexOf(b);
  });

  const polarity = reporte.polarity_index;
  const getPolarityLabel = (p: number) => {
    if (p >= 30) return { label: t("facets.low_polarity"), desc: t("facets.low_polarity_desc"), color: "#10B981", bg: "#ECFDF5" };
    if (p >= 15) return { label: t("facets.medium_polarity"), desc: t("facets.medium_polarity_desc"), color: "#F59E0B", bg: "#FFFBEB" };
    return { label: t("facets.high_polarity"), desc: t("facets.high_polarity_desc"), color: "#EF4444", bg: "#FEF2F2" };
  };
  const polInfo = getPolarityLabel(polarity);

  // Build PCI cards dynamically from tipo_reportado (e.g. ESTJ → E, S, T, J → Extraversion, Sensing, Thinking, Judging)
  const mbtiLetters = (reporte.tipo_reportado || "").split("");
  const POLE_MAP: Record<string, { labelKey: string; pciKey: keyof Reporte; icon: string; color: string; bg: string }> = {
    E: { labelKey: "facets.extraversion", pciKey: "pci_extraversion", icon: "ri-user-voice-line", color: "#F59E0B", bg: "#FFFBEB" },
    I: { labelKey: "facets.introversion", pciKey: "pci_extraversion", icon: "ri-user-voice-line", color: "#F59E0B", bg: "#FFFBEB" },
    S: { labelKey: "facets.sensing", pciKey: "pci_intuition", icon: "ri-lightbulb-flash-line", color: "#3B82F6", bg: "#EFF6FF" },
    N: { labelKey: "facets.intuition", pciKey: "pci_intuition", icon: "ri-lightbulb-flash-line", color: "#3B82F6", bg: "#EFF6FF" },
    T: { labelKey: "facets.thinking", pciKey: "pci_feeling", icon: "ri-heart-3-line", color: "#EC4899", bg: "#FDF2F8" },
    F: { labelKey: "facets.feeling", pciKey: "pci_feeling", icon: "ri-heart-3-line", color: "#EC4899", bg: "#FDF2F8" },
    J: { labelKey: "facets.judging", pciKey: "pci_perceiving", icon: "ri-eye-line", color: "#10B981", bg: "#ECFDF5" },
    P: { labelKey: "facets.perception", pciKey: "pci_perceiving", icon: "ri-eye-line", color: "#10B981", bg: "#ECFDF5" },
  };
  const pciCards = mbtiLetters
    .filter((letter) => POLE_MAP[letter])
    .map((letter) => {
      const def = POLE_MAP[letter];
      return {
        label: t(def.labelKey),
        value: reporte[def.pciKey] as number,
        icon: def.icon,
        color: def.color,
        bg: def.bg,
      };
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Header card with MBTI type */}
      <div className="rounded-3xl bg-white p-6 md:p-8" style={{ border: "1px solid #F3F4F6" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{t("facets.your_reported_type")}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
              {reporte.tipo_reportado}
            </h2>
            {reporte.individualized_type_label && (
              <p className="text-sm mt-1" style={{ color: "#7C3AED" }}>
                {reporte.individualized_type_label}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-full px-4 py-2 self-start md:self-auto">
            <i className="ri-calendar-line"></i>
            <span>{formatDate(reporte.fecha_aplicacion, i18n.language)}</span>
          </div>
        </div>

        {/* Polarity index */}
        <div className="flex items-start gap-4 rounded-2xl p-4" style={{ backgroundColor: polInfo.bg }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: polInfo.color }}>
            <i className="ri-contrast-2-line text-white text-base"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold" style={{ color: polInfo.color }}>
                {polInfo.label}
              </p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70" style={{ color: polInfo.color }}>
                {t("facets.polarity_index")} {polarity}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{polInfo.desc}</p>
          </div>
        </div>
      </div>

      {/* PCI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pciCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 flex flex-col items-center text-center"
            style={{ backgroundColor: card.bg, border: `1px solid ${card.color}15` }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: card.color }}>
              <i className={`${card.icon} text-white text-base`}></i>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Facetas by dimension */}
      <div className="flex flex-col gap-5">
        {dimensions.map((dim) => {
          const items = grouped[dim];
          const colors = DIMENSION_COLORS[dim] || { bg: "#F9FAFB", bar: "#6B7280", text: "#374151", light: "#F9FAFB" };

          return (
            <div
              key={dim}
              className="rounded-3xl bg-white overflow-hidden"
              style={{ border: "1px solid #F3F4F6" }}
            >
              {/* Dimension header */}
              <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: colors.bg }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.bar }}
                >
                  <i className="ri-fingerprint-line text-white text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: colors.text }}>{dim}</p>
                  <p className="text-xs" style={{ color: colors.text, opacity: 0.7 }}>
                    {items.length} {t("facets.facets_evaluated")}
                  </p>
                </div>
              </div>

              {/* Facetas list */}
              <div className="px-6 py-5 flex flex-col gap-5">
                {items.map((item) => {
                  const faceta = item.cat_facetas;
                  const scorePercent = Math.max(0, Math.min(100, (item.score / 5) * 100));
                  const barWidth = scorePercent / 2;
                  const classColor = SCORE_COLORS[item.clasificacion] || "#9CA3AF";
                  const isZeroScore = item.score === 0;

                  const leftPolo = faceta.polo_izquierdo;
                  const rightPolo = faceta.polo_derecho;
                  const wonPolo = item.polo_resultado;
                  // Support both abbreviations (E/I/S/N/T/F/J/P) and full pole text
                  const wonLeft = wonPolo === faceta.polo_izquierdo_letra || wonPolo === leftPolo;

                  // Bar grows from center toward the winning pole
                  const barLeft = wonLeft
                    ? `${50 - barWidth}%`
                    : "50%";
                  // End of the bar (where the dot sits)
                  const dotLeft = isZeroScore
                    ? "50%"
                    : wonLeft
                      ? `${50 - barWidth}%`
                      : `${50 + barWidth}%`;

                  return (
                    <div key={item.faceta_id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-black">{faceta.par_nombre}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: `${classColor}15`,
                              color: classColor,
                            }}
                          >
                            {SCORE_LABELS[item.clasificacion] || item.clasificacion}
                          </span>
                          <span className="text-xs font-bold text-gray-400">{t("facets.score_label")} {item.score}</span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="relative h-2.5 rounded-full bg-gray-100 overflow-hidden mb-2">
                        {/* Center marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-300 z-10" style={{ transform: "translateX(-50%)" }}></div>
                        {/* Bar - grows from center toward winning pole */}
                        {barWidth > 0 && (
                          <div
                            className="absolute top-0 h-full rounded-full transition-all"
                            style={{
                              width: `${barWidth}%`,
                              backgroundColor: classColor,
                              left: barLeft,
                            }}
                          />
                        )}
                        {/* Dot at the end of the bar (or center for zero score) */}
                        <div
                          className="absolute top-1/2 w-3 h-3 rounded-full border-2 border-white z-20"
                          style={{
                            backgroundColor: classColor,
                            left: dotLeft,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      </div>

                      {/* Polo labels */}
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className="font-medium transition-colors"
                          style={{ color: isZeroScore ? "#9CA3AF" : wonLeft ? classColor : "#9CA3AF" }}
                        >
                          {leftPolo}
                        </span>
                        <span className="text-xs text-gray-300">{t("facets.vs")}</span>
                        <span
                          className="font-medium transition-colors"
                          style={{ color: isZeroScore ? "#9CA3AF" : !wonLeft ? classColor : "#9CA3AF" }}
                        >
                          {rightPolo}
                        </span>
                      </div>

                      {/* Result */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <i className="ri-arrow-right-line text-xs" style={{ color: classColor }}></i>
                        <p className="text-xs font-medium" style={{ color: classColor }}>
                          {isZeroScore
                            ? `${t("facets.result_label")} ${t("facets.midzone")}`
                            : `${t("facets.result_label")} ${wonLeft ? leftPolo : rightPolo}`}
                          {item.is_individualized && !isZeroScore && (
                            <span className="ml-1.5 text-gray-400 font-normal">{t("facets.individualized")}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}