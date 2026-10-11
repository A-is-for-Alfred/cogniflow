import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

const WEBHOOK_URL = "https://n8n.srv1091049.hstgr.cloud/webhook/intro";

interface IntroModalProps {
  employeeName: string;
  userId: string;
  employeeId: number;
  onComplete: () => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function IntroModal({ employeeName, userId, employeeId, onComplete }: IntroModalProps) {
  const { t } = useTranslation();

  const LOADING_MESSAGES = [
    t("intro.analyzing"),
    t("intro.getting_to_know"),
    t("intro.evaluating"),
    t("intro.empathizing"),
    t("intro.preparing_experience"),
  ];
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    };
  }, []);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") {
      setErrorMsg(t("intro.pdf_only"));
      return;
    }
    setErrorMsg("");
    setPdfFile(file);
  };

  const startLoadingRotation = () => {
    setLoadingMsgIndex(0);
    loadingTimerRef.current = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
  };

  const stopLoadingRotation = () => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!pdfFile) {
      setErrorMsg(t("intro.attach_before"));
      return;
    }

    setErrorMsg("");
    setUploadStatus("uploading");
    startLoadingRotation();

    try {
      const formData = new FormData();
      formData.append("categoria", "archivo");
      formData.append("empleado", employeeName);
      formData.append("user_id", userId);
      formData.append("archivo", pdfFile, pdfFile.name);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // ── Parsear respuesta del webhook ──────────────────────────────────
      const rawText = await response.text();
      console.log("[Webhook] Raw response:", rawText.substring(0, 800));

      let payload: any = null;
      try {
        payload = JSON.parse(rawText);
      } catch {
        console.warn("[Webhook] La respuesta no es JSON válido");
      }

      // El n8n a veces envuelve la respuesta en un array
      let data = Array.isArray(payload) ? payload[0] : payload;

      // A veces viene envuelto en un campo 'data', 'body' o similar
      if (data && typeof data === "object" && !data.reported_type && data.data) {
        data = data.data;
      }
      if (data && typeof data === "object" && !data.reported_type && data.body) {
        data = data.body;
      }

      if (!data || typeof data !== "object") {
        throw new Error("El webhook no devolvió un JSON con los datos del reporte MBTI.");
      }

      console.log("[Webhook] Parsed data keys:", Object.keys(data));

      // ── Validar campos mínimos requeridos ────────────────────────────────
      if (!data.reported_type) {
        throw new Error("Falta 'reported_type' en la respuesta del webhook.");
      }
      if (!data.step1_scores || typeof data.step1_scores !== "object") {
        throw new Error("Falta 'step1_scores' en la respuesta del webhook.");
      }
      if (!Array.isArray(data.step2_facet_pairs) || data.step2_facet_pairs.length === 0) {
        throw new Error("Falta 'step2_facet_pairs' o está vacío en la respuesta.");
      }

      // ── Obtener catálogo de facetas ──────────────────────────────────────
      const { data: facetas, error: facetaError } = await supabase
        .from("cat_facetas")
        .select("id, dimension, par_nombre, polo_izquierdo, polo_derecho");

      if (facetaError) {
        console.error("[DB] Error al leer cat_facetas:", facetaError);
        throw facetaError;
      }

      if (!facetas || facetas.length === 0) {
        throw new Error("El catálogo de facetas (cat_facetas) está vacío.");
      }

      // Mapa: dimensión abreviada → nombre completo
      const DIM_MAP: Record<string, string> = {
        EI: "Extraversion-Introversion",
        SN: "Intuition-Sensing",
        TF: "Thinking-Feeling",
        JP: "Judging-Perceiving",
      };

      // Normalizar guiones largos (–) a guiones cortos (-)
      const normalizeDash = (s: string) => s.replace(/[\u2013\u2014]/g, "-");

      // Crear un map de catálogo por par_nombre normalizado (sin importar dimensión)
      // Clave: par_nombre normalizado → { catRow, parParts }
      const catByPar = new Map<string, { id: number; dimension: string; poloIzq: string; poloDer: string; parParts: string[] }>();

      for (const f of facetas) {
        const parNorm = normalizeDash(f.par_nombre);
        catByPar.set(parNorm, {
          id: f.id,
          dimension: f.dimension,
          poloIzq: f.polo_izquierdo,
          poloDer: f.polo_derecho,
          parParts: parNorm.split("-"),
        });

        // También indexar por par invertido (por si el webhook lo envía al revés)
        const parts = parNorm.split("-");
        if (parts.length === 2) {
          const inverted = `${parts[1]}-${parts[0]}`;
          catByPar.set(inverted, {
            id: f.id,
            dimension: f.dimension,
            poloIzq: f.polo_izquierdo,
            poloDer: f.polo_derecho,
            parParts: parNorm.split("-"),
          });
        }
      }

      console.log(`[DB] cat_facetas cargadas: ${facetas.length} registros`);

      // ── Insertar reporte (cabecera) ────────────────────────────────────
      const step1 = data.step1_scores || {};
      const reportPayload = {
        usuario_id: employeeId,
        fecha_aplicacion: new Date().toISOString().split("T")[0],
        tipo_reportado: String(data.reported_type || "ENFP").toUpperCase(),
        individualized_type_label: data.individualized_type_label || null,
        pci_extraversion: step1.EI?.score ?? 0,
        pci_intuition: step1.SN?.score ?? 0,
        pci_feeling: step1.TF?.score ?? 0,
        pci_perceiving: step1.JP?.score ?? 0,
        polarity_index: typeof data.polarity_index === "number" ? data.polarity_index : 0,
        omitted_responses: typeof data.omitted_responses === "number" ? data.omitted_responses : 0,
        profile_name: data.profile_name || null,
        mbti_type: data.mbti_type || null,
        profile_summary: data.profile_summary || null,
        questions: data.questions || null,
        one_thing_worth_noticing: data.one_thing_worth_noticing || null,
        coaching_note: data.coaching_note || null,
      };

      console.log("[DB] Insertando reporte:", reportPayload);

      // Check if a report already exists for this employee today
      const { data: existingReport } = await supabase
        .from("reportes")
        .select("id")
        .eq("usuario_id", employeeId)
        .eq("fecha_aplicacion", reportPayload.fecha_aplicacion)
        .order("id", { ascending: false })
        .limit(1);

      let reporteId: number;

      if (existingReport && existingReport.length > 0) {
        // Update existing report
        reporteId = existingReport[0].id;
        const { error: updateError } = await supabase
          .from("reportes")
          .update(reportPayload)
          .eq("id", reporteId);
        if (updateError) {
          console.error("[DB] Error al actualizar reporte:", updateError);
          throw updateError;
        }
        console.log(`[DB] Reporte actualizado con id=${reporteId}`);

        // Delete old facet results for this report before re-inserting
        const { error: deleteError } = await supabase
          .from("resultados_facetas")
          .delete()
          .eq("reporte_id", reporteId);
        if (deleteError) {
          console.warn("[DB] Error al borrar facetas anteriores:", deleteError);
        }
      } else {
        const { data: reporteData, error: reporteError } = await supabase
          .from("reportes")
          .insert(reportPayload)
          .select("id")
          .maybeSingle();

        if (reporteError) {
          console.error("[DB] Error al insertar reporte:", reporteError);
          throw reporteError;
        }
        if (!reporteData || !reporteData.id) {
          throw new Error("No se pudo obtener el ID del reporte insertado.");
        }

        reporteId = reporteData.id;
        console.log(`[DB] Reporte insertado con id=${reporteId}`);
      }

      // ── Insertar resultados de facetas ───────────────────────────────────
      const pairs = data.step2_facet_pairs || [];
      const resultados: any[] = [];
      const notFoundPairs: string[] = [];

      for (const pair of pairs) {
        // Normalizar par del webhook (guiones largos → cortos)
        const rawPair = pair.pair ? String(pair.pair) : "";
        const normPair = normalizeDash(rawPair);

        // Buscar en el catálogo por par (soporta directo e invertido gracias al indexado arriba)
        let faceta = catByPar.get(normPair);

        // Si no se encontró por par, intentar buscar por combinación dimensión + par original
        if (!faceta && pair.dimension && rawPair) {
          const fullDim = DIM_MAP[String(pair.dimension).toUpperCase()] || String(pair.dimension);
          const facetaMapKey = `${fullDim}|${rawPair}`;
          // No hace falta buscar aquí porque catByPar ya tiene las variantes
        }

        if (!faceta) {
          notFoundPairs.push(`${pair.dimension}|${rawPair}`);
          console.warn(`[DB] Faceta no encontrada en catálogo: dimension=${pair.dimension} pair=${rawPair} normalized=${normPair}`);
          continue;
        }

        // Determinar polo_resultado
        let poloResultado = "";
        const sp = String(pair.scored_pole || "").trim();
        const spLower = sp.toLowerCase();

        if (sp === "Left" || spLower === "left") {
          poloResultado = faceta.poloIzq;
        } else if (sp === "Right" || spLower === "right") {
          poloResultado = faceta.poloDer;
        } else if (sp === "Midzone" || spLower === "midzone") {
          // Para midzone, usar el nombre del par tal cual
          poloResultado = pair.scored_pole_name || rawPair || `${faceta.poloIzq}-${faceta.poloDer}`;
        } else if (sp) {
          // scored_pole es el nombre del polo directamente (ej: "Expressive", "Abstract")
          poloResultado = sp;
        } else {
          // Fallback a scored_pole_name
          poloResultado = pair.scored_pole_name || "";
        }

        resultados.push({
          reporte_id: reporteId,
          faceta_id: faceta.id,
          score: typeof pair.score === "number" ? pair.score : 0,
          polo_resultado: poloResultado,
          clasificacion: pair.classification || "midzone",
          is_individualized: Boolean(pair.is_individualized_type_facet),
        });
      }

      if (notFoundPairs.length > 0) {
        console.warn(`[DB] Pares no encontrados (${notFoundPairs.length}):`, notFoundPairs);
      }

      if (resultados.length === 0) {
        throw new Error("No se pudo mapear ninguna faceta del JSON contra el catálogo. Verifica que el catálogo cat_facetas contiene las facetas esperadas.");
      }

      console.log(`[DB] Insertando ${resultados.length} resultados_facetas`);

      const { data: insertedFacets, error: resultadosError } = await supabase
        .from("resultados_facetas")
        .insert(resultados)
        .select("id");

      if (resultadosError) {
        console.error("[DB] Error al insertar resultados_facetas:", resultadosError);
        throw resultadosError;
      }

      const insertedCount = insertedFacets?.length ?? 0;
      console.log(`[DB] ${insertedCount} facetas insertadas correctamente.`);

      if (insertedCount < pairs.length) {
        console.warn(`[DB] Se intentaron ${pairs.length} facetas pero solo se insertaron ${insertedCount}.`);
      }

      // Todo guardó bien — permitir acceso al panel
      stopLoadingRotation();
      setUploadStatus("success");
    } catch (err: any) {
      console.error("[IntroModal] Error en handleSend:", err);
      stopLoadingRotation();
      setUploadStatus("error");
      setErrorMsg(err?.message || "Hubo un error al procesar tu reporte. Por favor intenta de nuevo.");
    }
  };

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (uploadStatus === "uploading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden px-8 py-12 flex flex-col items-center gap-6 text-center">
          {/* Spinner */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-4 border-purple-100"
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"
              style={{ borderTopColor: "#7C3AED", borderRightColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "transparent" }}
            />
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#EDE9FE" }}
            >
              <i className="ri-brain-line text-purple-600 text-lg"></i>
            </div>
          </div>

          {/* Rotating messages */}
          <div className="flex flex-col gap-1">
            <p
              key={loadingMsgIndex}
              className="text-base font-semibold text-black transition-all duration-500"
              style={{ animation: "fadeSlideIn 0.5s ease" }}
            >
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
            <p className="text-xs text-gray-400">{t("intro.this_may_take")}</p>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {LOADING_MESSAGES.map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i === loadingMsgIndex ? "#7C3AED" : "#DDD6FE",
                  transform: i === loadingMsgIndex ? "scale(1.4)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (uploadStatus === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden px-8 py-10 flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#ECFDF5" }}
          >
            <i className="ri-check-line text-3xl" style={{ color: "#10B981" }}></i>
          </div>
          <h3 className="text-xl font-bold text-black">{t("intro.all_set")}</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            {t("intro.all_set_subtitle")}
          </p>
          <button
            onClick={() => onComplete()}
            className="mt-2 px-8 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D97706" }}
          >
            {t("intro.go_to_panel")}
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#A78BFA" }}
            >
              <i className="ri-brain-line text-white text-lg"></i>
            </div>
            <span className="font-bold text-lg text-black">Cogniflow</span>
          </div>
          <h2 className="text-2xl font-bold text-black leading-snug">
            {t("intro.welcome")}{" "}
            <span style={{ color: "#D97706" }}>{employeeName.split(" ")[0]}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {t("intro.welcome_subtitle")}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 flex flex-col gap-6">
          {/* PDF upload */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t("intro.report_label")}
            </p>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfChange}
            />
            {pdfFile ? (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-file-pdf-line text-xl text-red-500"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{pdfFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(pdfFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPdfFile(null);
                    if (pdfInputRef.current) pdfInputRef.current.value = "";
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-base"></i>
                </button>
              </div>
            ) : (
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="w-full flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-upload-cloud-line text-xl text-gray-400 group-hover:text-amber-500"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-amber-600 font-medium">
                  {t("intro.attach_pdf")}
                </span>
              </button>
            )}
          </div>

          {/* Error */}
          {errorMsg && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <i className="ri-error-warning-line"></i>
              {errorMsg}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end pt-1 pb-1">
            <button
              onClick={handleSend}
              disabled={!pdfFile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#D97706" }}
            >
              <i className="ri-send-plane-fill"></i>
              {t("intro.send_continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}