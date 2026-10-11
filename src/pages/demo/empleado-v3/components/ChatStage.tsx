import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ProcessedReport } from "../page";
import { isProfileResponse, type WebhookResponse } from "@/utils/generateProfilePdf";
import { isMuted, stopAll, play, speakTTS } from "@/pages/demo/empleado-v3/audioManager";
import FacetsCitedGraph, { type ResolvedFacet } from "./FacetsCitedGraph";
import type { RoadmapData } from "./roadmapTypes";
import { normalizeRoadmap } from "./normalizeRoadmap";

interface UIMessage {
  id: number;
  from: "ai" | "user";
  text: string;
  time: string;
  audioUrl?: string | null;
  audioLoading?: boolean;
  isPlaceholder?: boolean;
  facets?: ResolvedFacet[];
}

interface ChatStageProps {
  lang: "en" | "es";
  report: ProcessedReport;
  onBack: () => void;
  onSessionEnd: (roadmap: RoadmapData) => void;
}

const CHAT_WEBHOOK_URL = "https://ttracy007.app.n8n.cloud/webhook/chat";

const getVoiceId = (lang: string) => lang === "en" ? "OYTbf65OHHFELVut7v2H" : "ewn5JTa3lNPY8QVuZJi6";

const now = () => new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

const copy = {
  en: {
    nudge: "<b>20 real minutes.</b> The more you bring to this conversation, the sharper your plan.",
    companion: "Your guide",
    online: "Online · ready",
    speaking: "Speaking…",
    voice_on: "Voice ON",
    voice_off: "Voice OFF",
    listen: "Listen",
    playing: "Playing…",
    end_session: "End session",
    placeholder: "Tell me how you feel…",
    privacy: "Your conversations are 100% private.",
    recording: "Recording…",
    stop: "Stop",
    back_q: "← Change question",
    ending_session: "Building your roadmap…",
    ending_explanation: "Our system is now analyzing the conversation you had with the assistant, the goals you set, and your values, in order to structure a roadmap that will let you turn the opportunities identified today into actionable steps that will convert that identified potential into gains.",
    new_session: "New conversation",
    audio_sending: "Sending audio…",
    audio_placeholder: "[Audio message]",
    fallback: "Thanks for your message. I'll review it soon.",
    generating_audio: "Generating audio…",
    loading: "Starting your conversation…",
    audio_failed: "Could not process audio. Please try again.",
    audio_no_transcribe: "Could not transcribe audio. Try typing instead.",
    nexo_intro: "Good choice, let's start by talking a bit about what I can learn about you based on your report.",
    nexo_question: "Now, the question you chose",
  },
  es: {
    nudge: "<b>20 minutos de verdad.</b> Entre más traigas a esta conversación, más preciso será tu plan.",
    companion: "Tu guía",
    online: "En línea · listo",
    speaking: "Hablando…",
    voice_on: "Voz ON",
    voice_off: "Voz OFF",
    listen: "Escuchar",
    playing: "Reproduciendo…",
    end_session: "Finalizar sesión",
    placeholder: "Cuéntame cómo te sientes…",
    privacy: "Tus conversaciones son 100% privadas.",
    recording: "Grabando…",
    stop: "Detener",
    back_q: "← Cambiar pregunta",
    ending_session: "Construyendo tu roadmap…",
    ending_explanation: "Nuestro sistema está analizando la conversación que tuviste con el asistente, los objetivos que planteaste y tus valores, para estructurar un roadmap que te permitirá convertir las oportunidades hoy identificadas en accionables que convertirán ese potencial identificado en ganancias.",
    new_session: "Nueva conversación",
    audio_sending: "Enviando audio…",
    audio_placeholder: "[Mensaje de audio]",
    fallback: "Gracias por tu mensaje. Lo revisaré pronto.",
    generating_audio: "Generando audio…",
    loading: "Iniciando tu conversación…",
    audio_failed: "No se pudo procesar el audio. Intenta de nuevo.",
    audio_no_transcribe: "No se pudo transcribir el audio. Intenta escribiendo.",
    nexo_intro: "Buena elección, comencemos hablando un poco acerca de lo que puedo aprender de ti basado en tu reporte.",
    nexo_question: "Ahora la pregunta que elegiste",
  },
};

export default function ChatStage({ lang, report, onBack, onSessionEnd }: ChatStageProps) {
  const t = copy[lang];
  const { employeeId, userId, employeeName, language, gender, chosenQuestion, questions, profileSummary } = report;

  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const hasInit = useRef(false);
  const autoStarted = useRef(false);
  const autoScrollEnabled = useRef(false);
  const hasSentUserMessage = useRef(false);

  // Report questions (first 2) for webhook context
  const reportQuestions = (questions || [])
    .filter((q) => q.number === 1 || q.number === 2)
    .sort((a, b) => a.number - b.number);

  const buildSelectedQuestionPayload = () => {
    if (!chosenQuestion) return null;
    const base = {
      number: chosenQuestion.number,
      question_text: chosenQuestion.question_text,
    };
    if (chosenQuestion.tension) {
      return {
        ...base,
        tension: {
          name: chosenQuestion.tension.name,
          tension_id: chosenQuestion.tension.tension_id,
          tension_type: chosenQuestion.tension.tension_type,
        },
        intro: chosenQuestion.intro
          ? {
              raw: chosenQuestion.intro.raw,
              scope: chosenQuestion.intro.scope,
              sentences: chosenQuestion.intro.sentences,
            }
          : undefined,
        bullets: chosenQuestion.bullets,
      };
    }
    return base;
  };

  const stopAudio = () => {
    stopAll();
    setIsAudioPlaying(false);
    setSpeakingMsgId(null);
  };

  // Scroll to bottom — only after user has engaged (sent a message or scrolled manually)
  useEffect(() => {
    if (!autoScrollEnabled.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reset textarea height when input is cleared (e.g. after send)
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAll();
    };
  }, []);

  // Speak the strict explanation aloud while the roadmap is being built
  useEffect(() => {
    if (!isEnding) return;
    let cancelled = false;
    (async () => {
      const url = await speakTTS(t.ending_explanation, report.voiceId || getVoiceId(language));
      if (cancelled || !url) return;
      play(url);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnding]);

  // ── Init session & auto-start conversation ─────────────────────────────────
  useEffect(() => {
    if (!employeeId || !userId || hasInit.current) return;
    hasInit.current = true;

    const init = async () => {
      setLoading(true);

      // Build chosen question payload for persistence
      const chosenQPayload = chosenQuestion
        ? {
            number: chosenQuestion.number,
            question_text: chosenQuestion.question_text,
            tension: chosenQuestion.tension,
            intro: chosenQuestion.intro,
            bullets: chosenQuestion.bullets,
          }
        : null;

      // Always create a fresh session when starting a new question
      const startedAt = new Date();
      const sessionInsert: Record<string, unknown> = { employee_id: employeeId, started_at: startedAt.toISOString() };
      if (chosenQPayload) sessionInsert.chosen_question = chosenQPayload;
      const { data: ns } = await supabase
        .from("sessions")
        .insert(sessionInsert)
        .select("id")
        .single();
      const sid = ns?.id ?? 0;

      setSessionId(sid);

      // Show profile summary + chosen question, then wait for user's first message
      setMessages([]);
      setLoading(false);
      showInitialContext(sid);
    };

    init();
  }, [employeeId, userId]);

  // Resolve cited facet names against the employee's original facets to fetch
  // real score/poles/classification.
  //
  // Primary source: resultados_facetas (legacy / full data).
  // Fallback (V3): the new flow stores facets in questions_json (intro.facets_cited
  // + tension.facets) but does NOT write resultados_facetas — so we resolve pole
  // names against cat_facetas and take score/preference from tension.facets.
  const resolveFacetsCited = async (
    facetsCited: Array<{ name: string }>,
    tensionFacets?: Array<{ name: string; score?: number; preference?: string }>,
  ): Promise<ResolvedFacet[]> => {
    if (!employeeId) return [];

    const citedNames = (facetsCited || [])
      .map((f) => f?.name)
      .filter((n): n is string => !!n && !!String(n).trim());
    if (citedNames.length === 0) return [];

    const norm = (s: string) =>
      (s || "").toLowerCase().trim().replace(/[\u2013\u2014]/g, "-");

    try {
      const { data: reportes } = await supabase
        .from("reportes")
        .select("id")
        .eq("usuario_id", employeeId)
        .order("id", { ascending: false })
        .limit(1);
      const reporteId = reportes?.[0]?.id;
      if (!reporteId) return [];

      // 1) Primary: resultados_facetas joined with cat_facetas
      const { data: resultados } = await supabase
        .from("resultados_facetas")
        .select("*, cat_facetas(*)")
        .eq("reporte_id", reporteId);

      if (resultados && resultados.length > 0) {
        const lookup = new Map<string, Record<string, unknown>>();
        for (const r of resultados) {
          const f = (r as any).cat_facetas;
          if (!f) continue;
          const parNorm = norm(f.par_nombre);
          lookup.set(parNorm, r);
          lookup.set(norm(f.polo_izquierdo), r);
          lookup.set(norm(f.polo_derecho), r);
          const parts = parNorm.split("-");
          if (parts.length === 2) lookup.set(`${parts[1]}-${parts[0]}`, r);
        }

        const resolved: ResolvedFacet[] = [];
        for (const name of citedNames) {
          const r = lookup.get(norm(name));
          if (!r) continue;
          const f = (r as any).cat_facetas;
          resolved.push({
            key: `${f.id}-${name}`,
            name: f.par_nombre,
            leftPole: f.polo_izquierdo,
            rightPole: f.polo_derecho,
            score: Number((r as any).score) || 0,
            wonPole: (r as any).polo_resultado || "",
            classification: (r as any).clasificacion || "midzone",
          });
        }
        if (resolved.length > 0) return resolved;
      }

      // 2) Fallback: build from cat_facetas (pole → axis) + tension.facets (score/pref)
      const { data: facetas } = await supabase
        .from("cat_facetas")
        .select("id, par_nombre, polo_izquierdo, polo_derecho");
      if (!facetas || facetas.length === 0) return [];

      const poleToFacet = new Map<
        string,
        { id: number; par_nombre: string; polo_izquierdo: string; polo_derecho: string }
      >();
      for (const f of facetas) {
        poleToFacet.set(norm(f.polo_izquierdo), f);
        poleToFacet.set(norm(f.polo_derecho), f);
      }

      const tensionByPole = new Map<string, { score: number; preference: string }>();
      for (const tf of tensionFacets || []) {
        if (!tf?.name) continue;
        tensionByPole.set(norm(tf.name), {
          score: Number(tf.score) || 0,
          preference: tf.preference || "",
        });
      }

      const fallback: ResolvedFacet[] = [];
      for (const name of citedNames) {
        const f = poleToFacet.get(norm(name));
        if (!f) continue;
        const t = tensionByPole.get(norm(name));
        const score = t?.score ?? 0;
        const classification =
          t?.preference === "in-preference" || t?.preference === "out-of-preference"
            ? t.preference
            : "midzone";
        fallback.push({
          key: `${f.id}-${name}`,
          name: f.par_nombre,
          leftPole: f.polo_izquierdo,
          rightPole: f.polo_derecho,
          score,
          wonPole: name,
          classification,
        });
      }
      return fallback;
    } catch {
      return [];
    }
  };

  // ── Show initial context: sequential voice-guided intro ──────────────────
  const showInitialContext = async (sid: number) => {
    if (autoStarted.current) return;
    autoStarted.current = true;

    const intro = chosenQuestion?.intro;
    const position = (intro?.sentences?.position || "").trim();
    const purpose = (intro?.sentences?.purpose || "").trim();
    const bullets = chosenQuestion?.bullets || [];

    // Resolve cited axes to their original facet values
    const resolvedFacets = await resolveFacetsCited(
      intro?.facets_cited || [],
      chosenQuestion?.tension?.facets,
    );

    const blocks: Array<{ text: string; facets?: ResolvedFacet[]; waitAfterMs: number }> = [];

    if (position) {
      blocks.push({ text: position, facets: resolvedFacets.length > 0 ? resolvedFacets : undefined, waitAfterMs: 0 });
    }
    if (purpose) {
      blocks.push({ text: purpose, waitAfterMs: 3000 });
    }
    for (const b of bullets) {
      const text = getBulletDisplay(b);
      if (text) blocks.push({ text, waitAfterMs: 0 });
    }

    if (blocks.length === 0) {
      const qText = (chosenQuestion?.question_text || "").trim();
      const greeting = lang === "es"
        ? `Hola ${employeeName?.split(" ")[0] || ""}, exploremos juntos esta pregunta.`
        : `Hi ${employeeName?.split(" ")[0] || ""}, let's explore this question together.`;
      setMessages([{ id: Date.now(), from: "ai", text: qText || greeting, time: now() }]);
      return;
    }

    // Persist all blocks to DB before revealing
    for (const block of blocks) {
      await supabase.from("messages").insert({
        session_id: sid,
        employee_id: employeeId,
        input: { type: "ai", content: block.text },
        sent_at: new Date().toISOString(),
      });
    }

    // Reveal + speak each block sequentially (auto-scroll to follow the voice)
    autoScrollEnabled.current = true;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const msgId = Date.now() + i;

      setMessages((prev) => [...prev, {
        id: msgId,
        from: "ai" as const,
        text: block.text,
        time: now(),
        audioLoading: !isMuted(),
        facets: block.facets,
      }]);

      if (!isMuted()) {
        const url = await speakTTS(block.text, report.voiceId || getVoiceId(language));
        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, audioUrl: url, audioLoading: false } : m));
        if (url) {
          await playAudioAndWait(url, msgId, readingDelay(block.text) + 3000);
        } else {
          await delay(readingDelay(block.text));
        }
      } else {
        await delay(readingDelay(block.text));
      }

      if (block.waitAfterMs > 0) {
        await delay(block.waitAfterMs);
      }
    }
  };

  const playAudio = (url: string, msgId: number) => {
    stopAudio();
    setSpeakingMsgId(msgId);
    setIsAudioPlaying(true);
    play(url, {
      onEnd: () => { setIsAudioPlaying(false); setSpeakingMsgId(null); },
    });
  };

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const readingDelay = (text: string) => Math.min(6000, Math.max(1500, text.length * 45));

  const playAudioAndWait = (url: string, msgId: number, fallbackMs?: number): Promise<void> => {
    return new Promise((resolve) => {
      stopAudio();
      setSpeakingMsgId(msgId);
      setIsAudioPlaying(true);

      let settled = false;
      let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (fallbackTimer) clearTimeout(fallbackTimer);
        setIsAudioPlaying(false);
        setSpeakingMsgId(null);
        resolve();
      };

      // Safety net: if playback is interrupted (user muted or navigated away)
      // it never fires "ended", so fall back to a time-based reveal so the
      // intro keeps flowing at the same rhythm.
      fallbackTimer = setTimeout(finish, fallbackMs ?? 6000);
      play(url, { onEnd: finish });
    });
  };

  // Build display text for a bullet (prepend recall_window only if not already present)
  const getBulletDisplay = (bullet: { text?: string; recall_window?: string }) => {
    const text = bullet.text || "";
    const rw = (bullet.recall_window || "").trim();
    const textTrim = text.trim();
    if (rw && !textTrim.toLowerCase().startsWith(rw.toLowerCase())) {
      return `${rw} — ${text}`;
    }
    return text;
  };

  // ── DB helpers ─────────────────────────────────────────────────────────────
  const saveMsg = async (type: "text" | "ai", content: string, output?: WebhookResponse) => {
    if (!sessionId || !employeeId) return null;
    const payload: Record<string, unknown> = {
      session_id: sessionId, employee_id: employeeId,
      input: { type, content }, sent_at: new Date().toISOString(),
    };
    if (output && Object.keys(output).length > 0) payload.output = output;
    const { data } = await supabase.from("messages").insert(payload).select("id").single();
    return data?.id ?? null;
  };

  // ── Webhook send ───────────────────────────────────────────────────────────
  const sendToWebhook = async (payload: { type: string; content: string; mime_type?: string }) => {
    if (!sessionId || !employeeId || !userId) return null;

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    const msgNum = (count ?? 0) + 1;

    const isFirstUserMessage = !hasSentUserMessage.current;
    hasSentUserMessage.current = true;

    const res = await fetch(CHAT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        employee_id: employeeId,
        language: language,
        employee_name: employeeName || "",
        gender: gender || "",
        message_number: msgNum,
        is_first_user_message: isFirstUserMessage,
        input_timestamp: new Date().toISOString(),
        message: payload,
        report_questions: reportQuestions,
        profile_summary: profileSummary,
        selected_question: buildSelectedQuestionPayload(),
        chat_completo: false,
      }),
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text) return null;

    try {
      let json: any = JSON.parse(text);
      if (Array.isArray(json) && json[0]?.data) json = json[0].data;

      if (isProfileResponse(json)) {
        return {
          userText: payload.content,
          aiText: json.profile_summary || "",
          fullResponse: json,
          isProfile: true,
        };
      }

      if (json.original_user_input && json.coach_message) {
        return {
          userText: String(json.original_user_input),
          aiText: String(json.coach_message),
          fullResponse: json,
        };
      }

      const userText = json.original_user_input || json.user_message || payload.content;
      const aiText = json.coach_message || json.response || json.message || json.text || json.content || json.output || json.reply || "";

      if (userText && aiText) {
        return { userText: String(userText), aiText: String(aiText), fullResponse: json };
      }
      return null;
    } catch {
      return null;
    }
  };

  // ── Send text message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId || isTyping) return;

    autoScrollEnabled.current = true;

    const userMsg: UIMessage = { id: Date.now(), from: "user", text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const res = await sendToWebhook({ type: "text", content: text });

    if (res) {
      setMessages((prev) => prev.map((m) => m.id === userMsg.id ? { ...m, text: res.userText } : m));
      await saveMsg("text", res.userText, res.fullResponse);

      const aiMsgId = Date.now() + 1;
      const aiMsg: UIMessage = {
        id: aiMsgId,
        from: "ai",
        text: res.aiText,
        time: now(),
        audioLoading: !isMuted(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (!isMuted()) {
        speakTTS(res.aiText, report.voiceId || getVoiceId(language)).then((url) => {
          setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, audioUrl: url, audioLoading: false } : m));
          if (url) playAudio(url, aiMsgId);
        });
      }
    } else {
      await saveMsg("text", text);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: "ai",
        text: t.fallback,
        time: now(),
      }]);
    }

    setIsTyping(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    autoResize(e.target);
  };

  // ── Audio recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mime });
        handleAudioSend(blob, mime);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.onerror = () => {
        setAudioError(lang === "es" ? "Error al grabar audio" : "Recording error");
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setAudioError(lang === "es" ? "No se pudo acceder al micrófono" : "Could not access microphone");
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
  }, []);

  const handleAudioSend = async (blob: Blob, mimeType: string) => {
    if (!sessionId || !employeeId || !userId) return;

    setIsTyping(true);

    const tempId = Date.now();
    setMessages((prev) => [...prev, {
      id: tempId,
      from: "user",
      text: `🎙 ${t.audio_sending}`,
      isPlaceholder: true,
      time: now(),
    }]);

    const cleanupAndFallback = async () => {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessages((prev) => [...prev,
        { id: Date.now(), from: "user", text: t.audio_placeholder, time: now() },
        { id: Date.now() + 1, from: "ai", text: t.audio_no_transcribe, time: now() },
      ]);
    };

    try {
      const ext = mimeType.includes("webm") ? "webm" : "mp4";

      const isFirstUserMessage = !hasSentUserMessage.current;
      hasSentUserMessage.current = true;

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);
      const msgNum = (count ?? 0) + 1;

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("session_id", String(sessionId));
      formData.append("employee_id", String(employeeId));
      formData.append("language", language);
      formData.append("employee_name", employeeName || "");
      formData.append("gender", gender || "");
      formData.append("message_number", msgNum);
      formData.append("is_first_user_message", String(isFirstUserMessage));
      formData.append("input_timestamp", new Date().toISOString());
      formData.append("report_questions", JSON.stringify(reportQuestions));
      formData.append("profile_summary", profileSummary || "");
      formData.append("selected_question", JSON.stringify(buildSelectedQuestionPayload()));
      formData.append("chat_completo", "false");
      formData.append("audio", blob, `audio.${ext}`);

      const res = await fetch(CHAT_WEBHOOK_URL, { method: "POST", body: formData });

      if (!res.ok) {
        await cleanupAndFallback();
        setIsTyping(false);
        return;
      }

      const rawText = await res.text();
      if (!rawText) {
        await cleanupAndFallback();
        setIsTyping(false);
        return;
      }

      let json: any;
      try {
        json = JSON.parse(rawText);
        if (Array.isArray(json) && json[0]?.data) json = json[0].data;
      } catch {
        await cleanupAndFallback();
        setIsTyping(false);
        return;
      }

      const isProfile = isProfileResponse(json);
      const userText = isProfile
        ? (json.original_user_input || t.audio_placeholder)
        : (json.original_user_input || json.user_message || t.audio_placeholder);
      const aiText = isProfile
        ? (json.profile_summary || "")
        : (json.coach_message || json.response || json.message || json.text || json.content || json.output || json.reply || "");

      if (!aiText) {
        await cleanupAndFallback();
        setIsTyping(false);
        return;
      }

      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessages((prev) => [...prev, {
        id: Date.now(),
        from: "user",
        text: String(userText),
        time: now(),
      }]);

      await saveMsg("text", String(userText), json);

      const aiMsgId = Date.now() + 1;
      setMessages((prev) => [...prev, {
        id: aiMsgId,
        from: "ai",
        text: aiText,
        time: now(),
        audioLoading: !isMuted(),
      }]);

      if (!isMuted()) {
        speakTTS(aiText, report.voiceId || getVoiceId(language)).then((url) => {
          setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, audioUrl: url, audioLoading: false } : m));
          if (url) playAudio(url, aiMsgId);
        });
      }
    } catch {
      await cleanupAndFallback();
    }

    setIsTyping(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── End session ────────────────────────────────────────────────────────────
  const handleEndSession = async () => {
    if (!sessionId || isEnding) return;
    setIsEnding(true);
    stopAudio();

    // Mark session as ended in DB
    try {
      await supabase
        .from("sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sessionId);
    } catch (dbErr) {
      console.error("[Session End] Failed to mark session ended:", dbErr);
    }

    if (userId && employeeId) {
      let parsedRoadmap: any = null;
      let roadmapData: RoadmapData | null = null;
      let fetchError = "";

      try {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId);
        const msgNum = (count ?? 0) + 1;

        const res = await fetch(CHAT_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId,
            employee_id: employeeId,
            language: language,
            employee_name: employeeName || "",
            gender: gender || "",
            message_number: msgNum,
            input_timestamp: new Date().toISOString(),
            message: { type: "session_end", content: "" },
            report_questions: reportQuestions,
            profile_summary: profileSummary,
            selected_question: buildSelectedQuestionPayload(),
            chat_completo: true,
          }),
        });

        if (!res.ok) {
          fetchError = `Webhook HTTP ${res.status}: ${res.statusText}`;
          console.error("[Session End] Webhook failed:", fetchError);
        } else {
          const text = await res.text();
          if (!text) {
            fetchError = "Empty webhook response";
            console.error("[Session End]", fetchError);
          } else {
            try {
              let json: any = JSON.parse(text);

              // Unwrap n8n wrappers: top-level array -> first element
              if (Array.isArray(json)) json = json[0];

              // Unwrap common response envelopes (output / data). The `output`
              // field may itself be a JSON string or an already-parsed object.
              if (json && typeof json === "object") {
                if (typeof json.output === "string") {
                  try {
                    json = JSON.parse(json.output);
                  } catch (parseErr) {
                    console.error("[Session End] Failed to parse json.output as JSON:", parseErr, "Raw output:", json.output.slice(0, 500));
                    fetchError = "Failed to parse nested output JSON";
                    throw new Error(fetchError);
                  }
                } else if (json.output && typeof json.output === "object") {
                  json = json.output;
                } else if (json.data) {
                  json = json.data;
                }
              }

              parsedRoadmap = json;

              // Detect the roadmap payload and normalize it to the app's shape
              const hasObjectives =
                json && Array.isArray(json.objectives) && json.objectives.length > 0;
              const hasSummary =
                json && (typeof json.roadmap_summary === "string" || json.schema_version);

              console.log("[Session End] Roadmap detection:", {
                hasObjectives,
                hasSummary,
                objectivesCount: json?.objectives?.length,
                schemaVersion: json?.schema_version,
              });

              if (hasObjectives && hasSummary) {
                roadmapData = normalizeRoadmap(json);
                console.log("[Session End] Normalized roadmap:", {
                  objectives: roadmapData.objectives.length,
                  summary: roadmapData.roadmap_summary?.slice(0, 60),
                  profileName: roadmapData.reader_profile?.display_name,
                });
              } else {
                fetchError = `Missing roadmap data. hasObjectives=${hasObjectives}, hasSummary=${hasSummary}`;
                console.error("[Session End]", fetchError, "JSON keys:", Object.keys(json || {}));
              }
            } catch (parseErr: any) {
              fetchError = parseErr?.message || "JSON parse/normalize error";
              console.error("[Session End] JSON processing failed:", parseErr, "Raw text:", text.slice(0, 500));
            }
          }
        }
      } catch (networkErr: any) {
        fetchError = networkErr?.message || "Network or DB error";
        console.error("[Session End] Network/DB error:", networkErr);
      }

      // If we have a valid roadmap, show it — DB save is best-effort
      if (roadmapData) {
        // Try to save to DB, but don't block the UI on failure
        try {
          const saveResult = await supabase.from("roadmaps").insert({
            employee_id: employeeId,
            session_id: sessionId,
            roadmap_summary: roadmapData.roadmap_summary ?? "",
            objectives: roadmapData.objectives,
            roadmap_json: roadmapData,
          });
          if (saveResult.error) {
            console.error("[Session End] DB save error (non-blocking):", saveResult.error);
          } else {
            console.log("[Session End] Roadmap saved to DB successfully");
          }
        } catch (saveErr) {
          console.error("[Session End] DB save exception (non-blocking):", saveErr);
        }

        onSessionEnd(roadmapData);
        return;
      }

      // If we got here, we have an error but no roadmap
      console.error("[Session End] No roadmap to display. Error:", fetchError);
      // Still show the user something instead of silently returning to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: "ai",
          text:
            lang === "es"
              ? `No se pudo generar el roadmap (${fetchError}). Por favor intenta finalizar la sesión de nuevo.`
              : `Could not generate the roadmap (${fetchError}). Please try ending the session again.`,
          time: now(),
        },
      ]);
    }

    // Only return to chat if we truly have no roadmap and no error message was shown
    setIsEnding(false);
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    hasInit.current = false;
    autoStarted.current = false;
    autoScrollEnabled.current = false;
    hasSentUserMessage.current = false;
    setIsEnding(false);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 340, flexDirection: "column", gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#f3e8ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulseRing 2s infinite",
          }}
        >
          <i className="ri-brain-line" style={{ color: "#b1005d", fontSize: 22 }}></i>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#6e0431" }}>{t.loading}</p>
      </div>
    );
  }

  // ── Ending session — waiting for roadmap ───────────────────────────────────
  if (isEnding) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #d9d2cf",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(110,4,49,.05),0 8px 26px rgba(110,4,49,.08)",
          padding: "48px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        <div style={{
          position: "relative",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#b1005d",
            animation: "spin 1.2s linear infinite",
          }} />
          <i className="ri-brain-line" style={{ fontSize: 24, color: "#b1005d" }}></i>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#6e0431" }}>{t.ending_session}</h3>
        <div
          style={{
            background: "#faf7f8",
            border: "1px solid #d9d2cf",
            borderRadius: 12,
            padding: "18px 22px",
            maxWidth: 540,
            textAlign: "left",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b1005d", margin: "0 0 10px" }}>
            {lang === "es" ? "Procesando tu sesión" : "Processing your session"}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#3d3d3d", margin: 0, fontWeight: 500 }}>
            {t.ending_explanation}
          </p>
        </div>
      </div>
    );
  }

  // ── Chat view ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Nudge */}
      <div
        style={{
          background: "#f3e8ee",
          borderRadius: 11,
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: 14,
          color: "#3d3d3d",
          lineHeight: 1.5,
        }}
        dangerouslySetInnerHTML={{ __html: t.nudge }}
      />

      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #d9d2cf",
          borderRadius: 18,
          boxShadow: "0 1px 2px rgba(110,4,49,.05),0 8px 26px rgba(110,4,49,.08)",
          overflow: "hidden",
        }}
      >
        {/* Chat header */}
        <div style={{ background: "#6e0431", color: "#fff", padding: "13px 18px", display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: 9,
              background: "#b1005d",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="ri-brain-line" style={{ color: "#fff", fontSize: 14 }}></i>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.companion}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.72)" }}>
              {isAudioPlaying ? t.speaking : t.online}
            </div>
          </div>
          {/* End session — always available */}
          <button
            onClick={handleEndSession}
            disabled={isEnding}
            style={{
              marginLeft: "auto", fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: isEnding ? "not-allowed" : "pointer",
              border: "none", borderRadius: 999, padding: "5px 12px",
              background: "#b8532a", color: "#fff", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 5,
              opacity: isEnding ? 0.5 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            <i className="ri-check-double-line" style={{ fontSize: 12 }}></i>
            {t.end_session}
          </button>
        </div>

        {/* Chat body */}
        <div
          ref={chatBodyRef}
          style={{
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 11,
            background: "#faf7f8",
            minHeight: 280,
            maxHeight: 360,
            overflowY: "auto",
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
              {msg.from === "ai" && (
                <div
                  style={{
                    width: 26, height: 26, borderRadius: "50%", background: "#b1005d",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginRight: 7, flexShrink: 0, marginTop: 2,
                  }}
                >
                  <i className="ri-brain-line" style={{ color: "#fff", fontSize: 12 }}></i>
                </div>
              )}
              <div
                style={{
                  maxWidth: "82%",
                  padding: "11px 14px",
                  borderRadius: 14,
                  fontSize: 14,
                  lineHeight: 1.45,
                  background: msg.from === "ai" ? "#fff" : "#8f0f48",
                  color: msg.from === "ai" ? "#3d3d3d" : "#fff",
                  border: msg.from === "ai" ? "1px solid #e8e0e4" : "none",
                  borderBottomLeftRadius: msg.from === "ai" ? 4 : 14,
                  borderBottomRightRadius: msg.from === "user" ? 4 : 14,
                  opacity: msg.isPlaceholder ? 0.7 : 1,
                  animation: "riseMsg 0.35s ease both",
                }}
              >
                <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
                {msg.from === "ai" && msg.facets && msg.facets.length > 0 && (
                  <FacetsCitedGraph facets={msg.facets} lang={lang} />
                )}
                {msg.from === "ai" && msg.audioLoading && (
                  <p style={{ fontSize: 11, color: "#b1005d", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <i className="ri-loader-4-line" style={{ animation: "spin 1s linear infinite" }}></i>
                    {t.generating_audio}
                  </p>
                )}
                {msg.from === "ai" && msg.audioUrl && !msg.audioLoading && (
                  <button
                    onClick={() => { if (msg.audioUrl) playAudio(msg.audioUrl, msg.id); }}
                    style={{
                      marginTop: 5, fontSize: 11, fontWeight: 700, padding: "3px 9px",
                      borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                      background: speakingMsgId === msg.id ? "#fef3c7" : "#f3f4f6",
                      color: speakingMsgId === msg.id ? "#d97706" : "#8f0f48",
                      display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
                    }}
                  >
                    <i className={speakingMsgId === msg.id ? "ri-volume-up-line" : "ri-play-circle-line"} style={{ fontSize: 11 }}></i>
                    {speakingMsgId === msg.id ? t.playing : t.listen}
                  </button>
                )}
                <p style={{ fontSize: 10, marginTop: 3, textAlign: "right", opacity: 0.55 }}>{msg.time}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", background: "#b1005d",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: 7, flexShrink: 0,
              }}>
                <i className="ri-brain-line" style={{ color: "#fff", fontSize: 12 }}></i>
              </div>
              <div style={{
                borderRadius: 14, borderBottomLeftRadius: 4, padding: "11px 14px",
                background: "#fff", border: "1px solid #e8e0e4", display: "flex", gap: 4,
              }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#867b77", display: "inline-block",
                      animation: `blink 1.2s ${i * 0.2}s infinite`,
                    }}
                  ></span>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #d9d2cf", background: "#fff" }}>
          {audioError && <p style={{ fontSize: 11, color: "#b1005d", marginBottom: 6 }}>{audioError}</p>}
          {isRecording && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
              padding: "6px 12px", borderRadius: 9, background: "#fef2f2",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "blink 1s infinite" }}></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>{t.recording} {formatTime(recordingTime)}</span>
              <button
                onClick={stopRecording}
                style={{
                  marginLeft: "auto", fontFamily: "inherit", fontWeight: 700, fontSize: 11,
                  cursor: "pointer", border: "none", borderRadius: 999, padding: "4px 12px",
                  background: "#ef4444", color: "#fff", whiteSpace: "nowrap",
                }}
              >
                {t.stop}
              </button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#faf7f8", borderRadius: 12, padding: "8px 12px" }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTyping || isEnding}
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "none",
                cursor: isTyping || isEnding ? "not-allowed" : "pointer",
                background: isRecording ? "#ef4444" : "#8f0f48",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, opacity: isTyping || isEnding ? 0.4 : 1,
              }}
            >
              <i className={isRecording ? "ri-stop-fill" : "ri-mic-line"} style={{ color: "#fff", fontSize: 16 }}></i>
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              placeholder={isRecording ? t.recording : t.placeholder}
              disabled={isRecording || isTyping || isEnding}
              rows={1}
              style={{
                flex: 1, fontSize: 14, lineHeight: 1.45, background: "transparent", border: "none", outline: "none",
                color: "#3d3d3d", fontFamily: "inherit", resize: "none",
                overflowY: "auto", maxHeight: 96, minHeight: 20,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isRecording || isEnding}
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "none",
                cursor: !input.trim() || isTyping || isEnding ? "not-allowed" : "pointer",
                background: "#b1005d", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, opacity: !input.trim() || isTyping || isEnding ? 0.4 : 1,
              }}
            >
              <i className="ri-send-plane-fill" style={{ color: "#fff", fontSize: 16 }}></i>
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#867b77", textAlign: "center", marginTop: 6 }}>{t.privacy}</p>
        </div>
      </div>

      {/* Back button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <button
          onClick={onBack}
          disabled={isEnding}
          style={{
            fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: isEnding ? "not-allowed" : "pointer",
            border: "2px solid #8f0f48", borderRadius: 11, padding: "12px 24px",
            background: "none", color: "#8f0f48", whiteSpace: "nowrap", transition: "0.15s",
            opacity: isEnding ? 0.5 : 1, letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => { if (!isEnding) e.currentTarget.style.background = "#f3e8ee"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          {t.back_q}
        </button>
      </div>

      <style>{`
        @keyframes riseMsg { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes blink { 0%,80%,100% { opacity: 0.25 } 40% { opacity: 1 } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(177,0,93,0.4) } 50% { box-shadow: 0 0 0 8px rgba(177,0,93,0) } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}