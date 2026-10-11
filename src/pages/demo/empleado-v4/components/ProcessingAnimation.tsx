import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/cogniflow";
import type { ProcessedReport, CompanionQuestion } from "../page";

interface ProcessingAnimationProps {
  lang: "en" | "es";
  report: ProcessedReport;
  onComplete: (updatedReport: ProcessedReport) => void;
}

type AnimPhase = "chat" | "roadmap" | "checklist" | "growth";

const copy = {
  en: {
    processing: "Cogniflow is analyzing your profile…",
    phase_chat: "Reading your report",
    phase_roadmap: "Building your roadmap",
    phase_checklist: "Generating your action plan",
    phase_growth: "Drawing your growth curve",
    done_msg: "Your profile is ready",
    continue: "Continue →",
    waiting_webhook: "Building your question guide…",
    webhook_failed: "Could not load questions — using defaults",
    continue_anyway: "Continue with defaults →",
    waiting_countdown: "Sending values in {s}s…",
    chat_ai1: "Analyzing your personality profile…",
    chat_ai2: "MBTI type identified. Processing facets…",
    chat_ai3: "Building personalized insights…",
    chat_user: "Processing complete. Generating your guide.",
    roadmap_title: "YOUR ROADMAP TO THE SUMMIT",
    roadmap_sub: "This is the route Cogniflow has identified",
    stop1: "STARTING\nPOINT",
    stop2: "PRECISE\nDECISIONS",
    stop3: "CONFLICT\nRESOLUTION",
    stop4: "UNSTOPPABLE",
    check1: "Consult on purpose — pick the right 3 people",
    check2: "Hold one critique all the way to the finish",
    check3: "Name your frame before you commit",
    y_label: "PERSONAL GROWTH →",
    x_label: "ORGANIZATIONAL GOALS →",
    here: "You are here",
    summit: "SUMMIT",
  },
  es: {
    processing: "Cogniflow está analizando tu perfil…",
    phase_chat: "Leyendo tu reporte",
    phase_roadmap: "Construyendo tu roadmap",
    phase_checklist: "Generando tu plan de acción",
    phase_growth: "Trazando tu curva de crecimiento",
    done_msg: "Tu perfil está listo",
    continue: "Continuar →",
    waiting_webhook: "Generando tu guía de preguntas…",
    webhook_failed: "No se cargaron las preguntas — usando opciones base",
    continue_anyway: "Continuar con opciones base →",
    waiting_countdown: "Enviando valores en {s}s…",
    chat_ai1: "Analizando tu perfil de personalidad…",
    chat_ai2: "Tipo MBTI identificado. Procesando facetas…",
    chat_ai3: "Construyendo insights personalizados…",
    chat_user: "Procesamiento completo. Generando tu guía.",
    roadmap_title: "TU ROADMAP HACIA LA CIMA",
    roadmap_sub: "Esta es la ruta que Cogniflow ha identificado",
    stop1: "ESTÁS\nAQUÍ",
    stop2: "DECISIONES\nPRECISAS",
    stop3: "EXPERTO EN\nCONFLICTOS",
    stop4: "IMPARABLE",
    check1: "Consulta a propósito — elige a las 3 personas correctas",
    check2: "Sostén una crítica hasta el final",
    check3: "Nombra tu marco antes de decidir",
    y_label: "CRECIMIENTO PERSONAL →",
    x_label: "METAS ORGANIZACIONALES →",
    here: "Estás aquí",
    summit: "CIMA",
  },
};

const PHASES: AnimPhase[] = ["chat", "roadmap", "checklist", "growth"];
const PHASE_DURATIONS: Record<AnimPhase, number> = {
  chat: 8000,
  roadmap: 8000,
  checklist: 7000,
  growth: 7000,
};

const FETCH_TIMEOUT_MS = 600000; // 10 min por intento

function unwrapV3Json(raw: any): any {
  let data = raw;

  if (Array.isArray(data)) data = data[0];

  if (data?.data && typeof data.data === "object") {
    data = data.data;
  }

  if (data?.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    const inner = data.data;
    if (inner.reported_type || inner.step1_scores || inner.questions || inner.name || inner.mbti_type) {
      data = inner;
    }
  }

  if (data?.body && typeof data.body === "object") data = data.body;

  return data;
}

function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function resolveTipoReportado(profile: any, fallback: string): string {
  const raw = String(profile?.mbti_type || profile?.reported_type || "").toUpperCase().trim();
  const m = raw.match(/[EI][SN][TF][JP]/);
  if (m) return m[0];
  return fallback || "ESTP";
}

function slimItem(item: any): any {
  const slim: any = { number: item?.number };

  if (item?.tension) {
    const t = item.tension;
    slim.tension = {
      tension_id: t.tension_id,
      name: t.name,
      tension_type: t.tension_type,
      pattern: t.pattern,
      facets: Array.isArray(t.facets)
        ? t.facets.map((f: any) => ({ name: f.name, score: f.score, preference: f.preference }))
        : undefined,
    };
  }

  if (item?.intro) {
    const it = item.intro;
    slim.intro = {
      raw: it.raw,
      scope: it.scope,
      sentences: it.sentences,
      facets_cited: Array.isArray(it.facets_cited)
        ? it.facets_cited.map((f: any) => ({ name: f.name, score: f.score, numbered: f.numbered, preference: f.preference }))
        : undefined,
    };
  }

  if (Array.isArray(item?.bullets)) {
    slim.bullets = item.bullets.map((b: any) => ({
      bullet_id: b.bullet_id,
      kind: b.kind,
      text: b.text,
      recall_window: b.recall_window,
    }));
  }

  if (item?.counts) slim.counts = item.counts;
  if (item?.lint) slim.lint = item.lint;

  return slim;
}

export default function ProcessingAnimation({ lang, report, onComplete }: ProcessingAnimationProps) {
  const t = copy[lang];
  const [phase, setPhase] = useState<AnimPhase>("chat");
  const [showDone, setShowDone] = useState(false);
  const [chatLines, setChatLines] = useState<Array<{ from: "ai" | "user"; text: string; visible: boolean }>>([]);
  const [checksDone, setChecksDone] = useState<boolean[]>([false, false, false]);
  const [growthDrawn, setGrowthDrawn] = useState(false);
  const [processedReport, setProcessedReport] = useState<ProcessedReport>(report);
  const [webhookReady, setWebhookReady] = useState(false);
  const [webhookFailed, setWebhookFailed] = useState(false);
  const [webhookDebug, setWebhookDebug] = useState("");
  const [webhookJson, setWebhookJson] = useState("");
  const [webhookWaiting, setWebhookWaiting] = useState(false);
  const [webhookDelaySeconds, setWebhookDelaySeconds] = useState(0);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runWebhookRef = useRef<() => void>(() => {});
  const webhookFiredRef = useRef(false);

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => timerRefs.current.forEach(clearTimeout);
  }, []);

  const handleComplete = () => onComplete(processedReport);

  const handleRetryWebhook = () => {
    setWebhookFailed(false);
    setWebhookDebug("");
    setWebhookJson("");
    setWebhookReady(false);
    setWebhookWaiting(true);
    setWebhookDelaySeconds(0);
    webhookFiredRef.current = false;
    runWebhookRef.current();
  };

  useEffect(() => {
    if (!report.valoresWebhookUrl || !report.employeeId) {
      setWebhookReady(true);
      return;
    }

    const DELAY_MS = 135000; // 2 min 15 s

    const runWebhook = async () => {
      if (webhookFiredRef.current) return;
      webhookFiredRef.current = true;

      try {
        const payload = report.valoresPayload || {};
        const url = report.valoresWebhookUrl!;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        let response: Response;
        try {
          response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
        } catch (e: any) {
          const isTimeout = e?.name === "AbortError";
          const reason = isTimeout
            ? `Timeout agotado (${Math.round(FETCH_TIMEOUT_MS / 1000)}s sin respuesta)`
            : e?.message || e?.toString() || "Error desconocido";
          setWebhookDebug(
            `[Webhook VALORES] Fetch falló. No se recibió respuesta.\n` +
            `URL llamada: ${url}\n` +
            `Error: ${reason}\n\n` +
            `Nota: el workflow de n8n pudo haberse reanudado de todos modos. ` +
            `No se reintenta automáticamente para evitar el error 409 "execution is running already".`
          );
          setWebhookFailed(true);
          return;
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          let bodyPreview = "";
          try { bodyPreview = await response.text(); } catch { bodyPreview = "(no se pudo leer el body)"; }
          const is409 = response.status === 409;
          setWebhookDebug(
            `[Webhook VALORES] HTTP ${response.status}${is409 ? " — ejecución ya en curso" : ""}\n` +
            `URL llamada: ${report.valoresWebhookUrl}\n` +
            `Payload enviado: ${JSON.stringify(payload).slice(0, 500)}\n` +
            `Respuesta: ${bodyPreview.slice(0, 400)}` +
            (is409
              ? `\n\nEl workflow de n8n ya estaba en ejecución: una petición anterior ya lo reanudó. ` +
                `Revisa en n8n si la ejecución terminó; usa "Reintentar" solo si necesitas recuperar la respuesta.`
              : "")
          );
          setWebhookFailed(true);
          return;
        }
        const rawText = await response.text();
        let rawParsed: any = null;
        try { rawParsed = JSON.parse(rawText); } catch {
          setWebhookDebug(
            `[Webhook VALORES] Respuesta no es JSON válido\n` +
            `URL llamada: ${report.valoresWebhookUrl}\n` +
            `Respuesta cruda: ${rawText.slice(0, 400)}`
          );
          setWebhookFailed(true);
          return;
        }

        const data = unwrapV3Json(rawParsed);

        const hasNewFormat = Array.isArray(data?.items) && data.items.length > 0;
        const hasOldFormat = data && data.reported_type && data.step1_scores && Array.isArray(data.step2_facet_pairs);

        if (!hasNewFormat && !hasOldFormat) {
          setWebhookDebug(
            `[Webhook VALORES] Faltan campos requeridos (no se detectó items[] ni reported_type/step1_scores/step2_facet_pairs)\n` +
            `URL llamada: ${report.valoresWebhookUrl}\n` +
            `Data tras unwrap: ${JSON.stringify(data).slice(0, 400)}\n` +
            `Respuesta cruda original: ${rawText.slice(0, 300)}`
          );
          setWebhookJson(rawText);
          setWebhookFailed(true);
          return;
        }

        const { data: facetas } = await supabase.from("cat_facetas").select("id, dimension, par_nombre, polo_izquierdo, polo_derecho");
        if (!facetas || facetas.length === 0) return;

        const { data: existingReport } = await supabase.from("reportes").select("id, tipo_reportado").eq("usuario_id", report.employeeId).order("id", { ascending: false }).limit(1);
        const existingTipo = existingReport?.[0]?.tipo_reportado || "";

        const normDash = (s: string) => s.replace(/[\u2013\u2014]/g, "-");
        const catByPar = new Map<string, { id: number; poloIzq: string; poloDer: string }>();
        for (const f of facetas) {
          const k = normDash(f.par_nombre);
          catByPar.set(k, { id: f.id, poloIzq: f.polo_izquierdo, poloDer: f.polo_derecho });
          const parts = k.split("-");
          if (parts.length === 2) catByPar.set(`${parts[1]}-${parts[0]}`, { id: f.id, poloIzq: f.polo_izquierdo, poloDer: f.polo_derecho });
        }

        let reportPayload: Record<string, unknown>;
        let resultados: any[] = [];

        if (hasNewFormat) {
          const profile = data.profile || {};
          const items = data.items || [];
          const closing = data.closing || {};
          const lint = data.lint || {};
          const slimItems = items.map(slimItem);

          reportPayload = {
            usuario_id: report.employeeId,
            fecha_aplicacion: new Date().toISOString().split("T")[0],
            tipo_reportado: resolveTipoReportado(profile, existingTipo),
            individualized_type_label: profile.individualized_type_label || null,
            profile_name: profile.name || null,
            mbti_type: profile.mbti_type || null,
            profile_summary: profile.profile_summary || null,
            questions_json: slimItems,
            one_thing_worth_noticing: closing.one_thing || null,
            coaching_note: closing.coaching_note || null,
            lint_ok: lint.ok ?? null,
            lint_error_count: lint.error_count ?? null,
            pci_extraversion: 0,
            pci_intuition: 0,
            pci_feeling: 0,
            pci_perceiving: 0,
            polarity_index: 0,
            omitted_responses: 0,
          };

          const poleToFacet = new Map<string, { id: number; poloIzq: string; poloDer: string }>();
          for (const f of facetas) {
            poleToFacet.set(normDash(f.polo_izquierdo), { id: f.id, poloIzq: f.polo_izquierdo, poloDer: f.polo_derecho });
            poleToFacet.set(normDash(f.polo_derecho), { id: f.id, poloIzq: f.polo_izquierdo, poloDer: f.polo_derecho });
          }

          const facetByPole = new Map<string, { name: string; score: number; preference: string }>();
          for (const item of items) {
            const tf = item?.tension?.facets;
            if (!Array.isArray(tf)) continue;
            for (const f of tf) {
              const nm = (f?.name || "").trim();
              if (!nm || facetByPole.has(nm)) continue;
              facetByPole.set(nm, {
                name: nm,
                score: Number(f?.score) || 0,
                preference: f?.preference || "",
              });
            }
          }

          for (const [nm, ff] of facetByPole) {
            const f = poleToFacet.get(normDash(nm));
            if (!f) continue;
            const classification =
              ff.preference === "in-preference" || ff.preference === "out-of-preference"
                ? ff.preference
                : "midzone";
            resultados.push({
              reporte_id: 0,
              faceta_id: f.id,
              score: ff.score,
              polo_resultado: nm,
              clasificacion: classification,
              is_individualized: false,
            });
          }

          const qs: CompanionQuestion[] = slimItems.map((item: any) => ({
            number: item.number,
            question_text: item.bullets?.map((b: any) => b.text).join(" ") || item.intro?.raw || "",
            summary: item.tension?.name || "",
            tension: item.tension,
            intro: item.intro,
            bullets: item.bullets,
            counts: item.counts,
            lint: item.lint,
          }));

          setProcessedReport((prev) => ({
            ...prev,
            questions: qs,
            profileSummary: profile.profile_summary || "",
          }));

        } else {
          const step1 = data.step1_scores || {};
          reportPayload = {
            usuario_id: report.employeeId,
            fecha_aplicacion: new Date().toISOString().split("T")[0],
            tipo_reportado: String(data.reported_type || "").toUpperCase(),
            individualized_type_label: data.individualized_type_label || null,
            pci_extraversion: step1.EI?.score ?? 0,
            pci_intuition: step1.SN?.score ?? 0,
            pci_feeling: step1.TF?.score ?? 0,
            pci_perceiving: step1.JP?.score ?? 0,
            polarity_index: typeof data.polarity_index === "number" ? data.polarity_index : 0,
            omitted_responses: typeof data.omitted_responses === "number" ? data.omitted_responses : 0,
            profile_name: data.profile_name || data.name || null,
            mbti_type: data.mbti_type || data.reported_type || null,
            profile_summary: data.profile_summary || null,
            questions: data.questions || null,
            one_thing_worth_noticing: data.one_thing_worth_noticing || null,
            coaching_note: data.coaching_note || null,
          };

          for (const pair of (data.step2_facet_pairs || [])) {
            const normPair = normDash(String(pair.pair || ""));
            const faceta = catByPar.get(normPair);
            if (!faceta) continue;
            const sp = String(pair.scored_pole || "").trim().toLowerCase();
            const poloResultado = sp === "left" ? faceta.poloIzq : sp === "right" ? faceta.poloDer : (pair.scored_pole_name || normPair);
            resultados.push({
              reporte_id: 0,
              faceta_id: faceta.id,
              score: typeof pair.score === "number" ? pair.score : 0,
              polo_resultado: poloResultado,
              clasificacion: pair.classification || "midzone",
              is_individualized: Boolean(pair.is_individualized_type_facet),
            });
          }

          const qs: CompanionQuestion[] = Array.isArray(data.questions)
            ? data.questions.map((q: any) => ({
                number: q.number,
                question_text: q.question_text,
                summary: q.question_text?.slice(0, 80) + "…",
              }))
            : [];

          setProcessedReport((prev) => ({
            ...prev,
            questions: qs,
            profileSummary: data.profile_summary || "",
          }));
        }

        let reporteId: number;
        if (existingReport && existingReport.length > 0) {
          reporteId = existingReport[0].id;
          const { error: updErr } = await supabase.from("reportes").update(reportPayload).eq("id", reporteId);
          if (updErr) {
            setWebhookDebug(`[Webhook VALORES] Error al guardar el reporte (UPDATE id ${reporteId}): ${updErr.message}`);
            setWebhookFailed(true);
            return;
          }
          await supabase.from("resultados_facetas").delete().eq("reporte_id", reporteId);
        } else {
          const { data: nd, error: insErr } = await supabase.from("reportes").insert(reportPayload).select("id").maybeSingle();
          if (insErr) {
            setWebhookDebug(`[Webhook VALORES] Error al guardar el reporte (INSERT): ${insErr.message}`);
            setWebhookFailed(true);
            return;
          }
          if (!nd) return;
          reporteId = nd.id;
        }

        if (resultados.length > 0) {
          for (const r of resultados) r.reporte_id = reporteId;
          await supabase.from("resultados_facetas").insert(resultados);
        }

        setWebhookJson(rawText);
        setWebhookReady(true);
      } catch (err: any) {
        const errMsg = err?.message || err?.toString() || "Error desconocido";
        setWebhookDebug(
          `[Webhook VALORES] Error interno al procesar la respuesta.\n` +
          `URL llamada: ${report.valoresWebhookUrl}\n` +
          `Error: ${errMsg}`
        );
        setWebhookFailed(true);
      }
    };

    runWebhookRef.current = runWebhook;

    const elapsed = Date.now() - (report._introResponseTimestamp || Date.now());
    const waitMs = Math.max(0, DELAY_MS - elapsed);
    const delaySeconds = Math.ceil(waitMs / 1000);

    if (waitMs <= 0) {
      runWebhook();
      return;
    }

    setWebhookWaiting(true);
    setWebhookDelaySeconds(delaySeconds);

    const countdownInterval = setInterval(() => {
      const remaining = DELAY_MS - (Date.now() - (report._introResponseTimestamp || 0));
      setWebhookDelaySeconds(Math.max(0, Math.ceil(remaining / 1000)));
    }, 1000);

    const delayTimer = setTimeout(() => {
      clearInterval(countdownInterval);
      setWebhookWaiting(false);
      runWebhook();
    }, waitMs);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  useEffect(() => {
    let elapsed = 0;
    PHASES.forEach((p) => {
      addTimer(() => setPhase(p), elapsed);
      elapsed += PHASE_DURATIONS[p];
    });
    addTimer(() => setShowDone(true), elapsed);
  }, []);

  useEffect(() => {
    if (phase !== "chat") return;
    const msgs = [
      { from: "ai" as const, text: t.chat_ai1 },
      { from: "ai" as const, text: t.chat_ai2 },
      { from: "ai" as const, text: t.chat_ai3 },
      { from: "user" as const, text: t.chat_user },
    ];
    msgs.forEach((m, i) => {
      addTimer(() => {
        setChatLines((prev) => {
          const next = [...prev];
          if (!next[i]) {
            next[i] = { ...m, visible: true };
          }
          return next;
        });
      }, 1200 + i * 1600);
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== "checklist") return;
    [0, 1, 2].forEach((i) => {
      addTimer(() => {
        setChecksDone((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 800 + i * 1800);
    });
  }, [phase]);

  useEffect(() => {
    if (phase !== "growth") return;
    addTimer(() => setGrowthDrawn(true), 800);
  }, [phase]);

  const phaseLabels: Record<AnimPhase, string> = {
    chat: t.phase_chat,
    roadmap: t.phase_roadmap,
    checklist: t.phase_checklist,
    growth: t.phase_growth,
  };

  return (
    <div>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #d9d2cf",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(110,4,49,.05),0 8px 26px rgba(110,4,49,.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#6e0431",
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#b1005d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              animation: "pulseRing 3s ease infinite",
            }}
          >
            <i className="ri-brain-line" style={{ color: "#fff", fontSize: 18 }}></i>
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Cogniflow</p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>{t.processing}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {PHASES.map((p, i) => (
              <div
                key={p}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: PHASES.indexOf(phase) >= i ? "#b1005d" : "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.4s",
                  flexShrink: 0,
                }}
                title={phaseLabels[p]}
              >
                {PHASES.indexOf(phase) > i ? (
                  <i className="ri-check-line" style={{ color: "#fff", fontSize: 13 }}></i>
                ) : PHASES.indexOf(phase) === i ? (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", animation: "blink 1s infinite" }}></div>
                ) : (
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "10px 28px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#b1005d", animation: "blink 1s infinite" }}></div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#8f0f48", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {phaseLabels[phase]}
          </p>
        </div>

        <div style={{ padding: "18px 28px 28px", minHeight: 380 }}>

          {phase === "chat" && (
            <div
              style={{
                background: "#faf7f8",
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid #d9d2cf",
                maxWidth: 500,
                margin: "0 auto",
              }}
            >
              <div style={{ background: "#6e0431", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "#b1005d" }}></div>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>Cogniflow AI</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>Procesando reporte…</p>
                </div>
              </div>
              <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
                {chatLines.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                      animation: "riseIn 0.8s ease both",
                    }}
                  >
                    {msg.from === "ai" && (
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#b1005d", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 7, flexShrink: 0, marginTop: 2 }}>
                        <i className="ri-brain-line" style={{ color: "#fff", fontSize: 11 }}></i>
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "9px 13px",
                        borderRadius: 12,
                        fontSize: 12,
                        lineHeight: 1.5,
                        background: msg.from === "ai" ? "#fff" : "#8f0f48",
                        color: msg.from === "ai" ? "#3d3d3d" : "#fff",
                        border: msg.from === "ai" ? "1px solid #e8e0e4" : "none",
                        borderBottomLeftRadius: msg.from === "ai" ? 3 : 12,
                        borderBottomRightRadius: msg.from === "user" ? 3 : 12,
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLines.length < 4 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 29 }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#867b77",
                          display: "inline-block",
                          animation: `blink 2.4s ${i * 0.4}s infinite`,
                        }}
                      ></span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === "roadmap" && (
            <div
              style={{
                background: "linear-gradient(160deg, #4a1b6b 0%, #752b8c 40%, #8f0f48 100%)",
                borderRadius: 16,
                padding: "20px 22px",
                maxWidth: 520,
                margin: "0 auto",
                boxShadow: "0 4px 20px rgba(110,4,49,0.25)",
                animation: "riseIn 1s ease both",
              }}
            >
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, textAlign: "center", marginBottom: 4 }}>{t.roadmap_title}</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, textAlign: "center", marginBottom: 14 }}>{t.roadmap_sub}</p>

              <svg viewBox="0 0 520 200" style={{ width: "100%", height: "auto", display: "block" }}>
                <path d="M0,200 L0,138 L110,110 L200,138 L300,75 L400,105 L475,28 L520,50 L520,200 Z" fill="#5c1a7a" />
                <path d="M0,200 L0,155 L100,140 L220,160 L350,128 L440,148 L520,120 L520,200 Z" fill="rgba(0,0,0,0.2)" />
                <path d="M475,28 L455,50 L466,52 L458,64 L490,58 L483,44 L498,44 Z" fill="rgba(255,255,255,0.9)" />
                <path
                  d="M44,180 C120,170 160,145 220,138 C280,130 320,108 375,100 C420,93 450,68 475,42"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2.5"
                  strokeDasharray="4 8"
                  strokeLinecap="round"
                  style={{ animation: "drawRoad 4s 0.6s ease both", strokeDashoffset: 500 }}
                />
                {[
                  { cx: 44, cy: 180, label: t.stop1, color: "#b1005d" },
                  { cx: 175, cy: 143, label: t.stop2, color: "#752b8c" },
                  { cx: 340, cy: 100, label: t.stop3, color: "#006c93" },
                  { cx: 475, cy: 42, label: t.stop4, color: "#f5802c" },
                ].map((cp, i) => (
                  <g key={i} style={{ animation: `riseIn 0.8s ${1 + i * 1}s both` }}>
                    <circle cx={cp.cx} cy={cp.cy} r="11" fill={cp.color} stroke="#fff" strokeWidth="2" />
                    <text x={cp.cx} y={cp.cy + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff">{i + 1}</text>
                    {cp.label.split("\n").map((line, li) => (
                      <text
                        key={li}
                        x={i === 0 ? cp.cx + 18 : i === 3 ? cp.cx - 10 : cp.cx}
                        y={i === 0 ? cp.cy - 8 + li * 12 : i === 3 ? cp.cy - 22 + li * 12 : cp.cy + 24 + li * 12}
                        textAnchor={i === 0 ? "start" : i === 3 ? "middle" : "middle"}
                        fontSize="8"
                        fontWeight="800"
                        fill="#fff"
                        opacity="0.95"
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                ))}
                <line x1="475" y1="28" x2="475" y2="4" stroke="#f5802c" strokeWidth="2" />
                <path d="M475,5 L506,12 L475,19 Z" fill="#f5802c" />
              </svg>
            </div>
          )}

          {phase === "checklist" && (
            <div style={{ maxWidth: 480, margin: "0 auto", animation: "riseIn 1s ease both" }}>
              <div
                style={{
                  background: "#faf7f8",
                  border: "1px solid #d9d2cf",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <div style={{ background: "#6e0431", padding: "12px 18px" }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                    {lang === "es" ? "3 Puntos de control · Tu plan" : "3 Checkpoints · Your plan"}
                  </p>
                </div>
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { text: t.check1, color: "#b1005d", biz: lang === "es" ? "↑ Decisiones informadas" : "↑ Informed decisions" },
                    { text: t.check2, color: "#752b8c", biz: lang === "es" ? "↑ Los problemas salen una vez" : "↑ Problems surface once" },
                    { text: t.check3, color: "#006c93", biz: lang === "es" ? "↑ Decisiones que no revives" : "↑ Decisions you don't relitigate" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        background: "#fff",
                        borderRadius: 10,
                        padding: "12px 14px",
                        border: "1px solid #ede5ea",
                        opacity: checksDone[i] ? 1 : 0.35,
                        transform: checksDone[i] ? "none" : "translateX(-8px)",
                        transition: "all 0.45s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          background: item.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "background 0.3s",
                        }}
                      >
                        {checksDone[i]
                          ? <i className="ri-check-line" style={{ color: "#fff", fontSize: 14 }}></i>
                          : <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
                        }
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#3d3d3d", lineHeight: 1.4 }}>{item.text}</p>
                        <p style={{ fontSize: 11, color: "#00875a", fontWeight: 600, marginTop: 3 }}>{item.biz}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === "growth" && (
            <div
              style={{
                background: "#faf7f8",
                border: "1px solid #d9d2cf",
                borderRadius: 14,
                padding: "16px 18px",
                maxWidth: 500,
                margin: "0 auto",
                animation: "riseIn 1s ease both",
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#867b77", marginBottom: 8 }}>
                {lang === "es" ? "Tu trayectoria de crecimiento" : "Your growth trajectory"}
              </p>
              <svg viewBox="0 0 520 160" style={{ width: "100%", height: "auto", display: "block" }}>
                <line x1="44" y1="130" x2="500" y2="130" stroke="#d9d2cf" strokeWidth="1.5" />
                <line x1="44" y1="130" x2="44" y2="12" stroke="#d9d2cf" strokeWidth="1.5" />
                {[50, 75, 100].map((y) => (
                  <line key={y} x1="44" y1={y} x2="500" y2={y} stroke="#ede5ea" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                <text x="272" y="148" textAnchor="middle" fontSize="10" fontWeight="700" fill="#867b77">{t.x_label}</text>
                <text x="16" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill="#867b77" transform="rotate(-90 16 72)">{t.y_label}</text>
                <path
                  d="M66,120 C150,112 210,94 285,72 C350,52 420,38 485,22"
                  fill="none"
                  stroke="url(#growthGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 480,
                    strokeDashoffset: growthDrawn ? 0 : 480,
                    transition: "stroke-dashoffset 3.6s 0.4s cubic-bezier(.3,.6,.3,1)",
                  }}
                />
                <defs>
                  <linearGradient id="growthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#752b8c" />
                    <stop offset="100%" stopColor="#b1005d" />
                  </linearGradient>
                </defs>
                <circle cx="66" cy="120" r="7" fill="#752b8c" />
                <text x="66" y="108" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3d3d3d">{t.here}</text>
                <path d="M485,22 L502,16 L493,32 Z" fill="#b1005d" style={{ opacity: growthDrawn ? 1 : 0, transition: "opacity 0.6s 3.6s" }} />
                <text x="490" y="14" textAnchor="end" fontSize="9" fontWeight="800" fill="#b1005d" style={{ opacity: growthDrawn ? 1 : 0, transition: "opacity 0.6s 4s" }}>
                  {t.summit}
                </text>
              </svg>
            </div>
          )}

          {showDone && (
            <div
              style={{
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                animation: "riseIn 1s ease both",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: webhookReady ? "#f3e8ee" : webhookFailed ? "#fff7ed" : "#f3e8ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {!webhookReady && !webhookFailed ? (
                  <>
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: "3px solid #f3e8ee",
                    }} />
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: "3px solid transparent",
                      borderTopColor: "#b1005d",
                      animation: "spin 1.8s linear infinite",
                    }} />
                    <i className="ri-brain-line" style={{ fontSize: 20, color: "#b1005d" }}></i>
                  </>
                ) : webhookFailed ? (
                  <i className="ri-error-warning-line" style={{ fontSize: 26, color: "#f5802c" }}></i>
                ) : (
                  <i className="ri-check-double-line" style={{ fontSize: 26, color: "#b1005d" }}></i>
                )}
              </div>

              <p style={{ fontSize: 14, fontWeight: 700, color: "#6e0431", textAlign: "center" }}>
                {webhookWaiting && webhookDelaySeconds > 0
                  ? t.waiting_countdown.replace("{s}", String(webhookDelaySeconds))
                  : !webhookReady && !webhookFailed
                    ? t.waiting_webhook
                    : webhookFailed
                      ? t.webhook_failed
                      : t.done_msg}
              </p>

              {(webhookReady || webhookFailed) && (
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                  {webhookFailed && (
                    <button
                      onClick={handleRetryWebhook}
                      style={{
                        fontFamily: "inherit",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        border: "1px solid #b1005d",
                        borderRadius: 11,
                        padding: "13px 26px",
                        background: "#fff",
                        color: "#b1005d",
                        transition: "0.15s",
                        whiteSpace: "nowrap",
                        animation: "riseIn 0.8s ease both",
                        letterSpacing: "0.01em",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#faf0f5"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                    >
                      {lang === "es" ? "Reintentar" : "Retry"}
                    </button>
                  )}
                  <button
                    onClick={handleComplete}
                    style={{
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      border: "none",
                      borderRadius: 11,
                      padding: "14px 32px",
                      background: webhookFailed ? "#f5802c" : "#b1005d",
                      color: "#fff",
                      transition: "0.15s",
                      whiteSpace: "nowrap",
                      animation: "riseIn 0.8s ease both",
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    {webhookFailed ? t.continue_anyway : t.continue}
                  </button>
                </div>
              )}

              {webhookFailed && (
                <div style={{ width: "100%", maxWidth: 540, marginTop: 4, animation: "riseIn 0.8s ease both" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "#fff7ed",
                    border: "1px solid #f5802c",
                    borderRadius: "10px 10px 0 0",
                    padding: "10px 14px",
                  }}>
                    <i className="ri-error-warning-line" style={{ fontSize: 16, color: "#f5802c" }}></i>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>
                      {lang === "es" ? "Detalles del error" : "Error details"}
                    </p>
                  </div>
                  <div style={{
                    background: "#1e1a1c",
                    borderRadius: "0 0 10px 10px",
                    padding: "14px 16px",
                    maxHeight: 260,
                    overflow: "auto",
                    textAlign: "left",
                  }}>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 11, lineHeight: 1.6, color: "#ffd7a8" }}>
                      {webhookDebug}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes blink { 0%,80%,100% { opacity: 0.25 } 40% { opacity: 1 } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(177,0,93,0.4) } 50% { box-shadow: 0 0 0 8px rgba(177,0,93,0) } }
        @keyframes drawRoad { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}