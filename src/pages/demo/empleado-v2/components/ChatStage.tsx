import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ProcessedReport } from "../page";
import { isProfileResponse, type WebhookResponse } from "@/utils/generateProfilePdf";

export interface RoadmapObjective {
  order: number;
  title: string;
  path_type: string;
  mountain_type: string;
  justification: string;
}

export interface RoadmapData {
  roadmap_summary: string;
  objectives: RoadmapObjective[];
}

interface UIMessage {
  id: number;
  from: "ai" | "user";
  text: string;
  time: string;
  audioUrl?: string | null;
  audioLoading?: boolean;
  isPlaceholder?: boolean;
}

interface ChatStageProps {
  lang: "en" | "es";
  report: ProcessedReport;
  onBack: () => void;
  onSessionEnd: (roadmap: RoadmapData) => void;
}

const CHAT_WEBHOOK_URL = "https://ttracy007.app.n8n.cloud/webhook/chat";
const ELEVENLABS_API_KEY = "sk_862035862ac3086282afeed249e5bcacd281ebf966a2e029";

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
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const hasInit = useRef(false);
  const autoStarted = useRef(false);
  const autoScrollEnabled = useRef(false);

  // Report questions (first 2) for webhook context
  const reportQuestions = (questions || [])
    .filter((q) => q.number === 1 || q.number === 2)
    .sort((a, b) => a.number - b.number);

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
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
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  // ── Init session & auto-start conversation ─────────────────────────────────
  useEffect(() => {
    if (!employeeId || !userId || hasInit.current) return;
    hasInit.current = true;

    const init = async () => {
      setLoading(true);

      // Build chosen question payload for persistence
      const chosenQPayload = chosenQuestion ? { number: chosenQuestion.number, question_text: chosenQuestion.question_text } : null;

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

  // ── Show initial context: 3 separate messages with bridge texts ──────────
  const showInitialContext = async (sid: number) => {
    if (autoStarted.current) return;
    autoStarted.current = true;

    if (!chosenQuestion || !employeeId || !userId) {
      const greeting = lang === "es"
        ? `Hola ${employeeName?.split(" ")[0] || ""}, exploremos juntos esta pregunta.`
        : `Hi ${employeeName?.split(" ")[0] || ""}, let's explore this question together.`;
      setMessages([{ id: 1, from: "ai", text: greeting, time: now() }]);
      return;
    }

    try {
      // Build 4 separate messages:
      //   1. nexo_intro (preset – introduction)
      //   2. profileSummary (from DB – the user's profile summary)
      //   3. nexo_question (preset – bridge to the question)
      //   4. chosenQuestion.question_text (from DB – the actual question)
      const msg1 = t.nexo_intro;
      const msg2 = profileSummary || null;
      const msg3 = t.nexo_question;
      const msg4 = chosenQuestion.question_text || null;

      // Build ordered list — skip any that are truly empty
      const allTexts = [msg1, msg2, msg3, msg4].filter((t): t is string => typeof t === "string" && t.trim().length > 0);

      // Full text for TTS (combined, so audio reads smoothly)
      const fullTtsText = allTexts.join("\n\n");

      const baseId = Date.now();

      // Save each context message to DB
      for (const text of allTexts) {
        await supabase.from("messages").insert({
          session_id: sid,
          employee_id: employeeId,
          input: { type: "ai", content: text },
          sent_at: new Date().toISOString(),
        });
      }

      const msgs: UIMessage[] = allTexts.map((text, idx) => ({
        id: baseId + idx,
        from: "ai" as const,
        text,
        time: now(),
        audioLoading: idx === allTexts.length - 1 && ttsEnabled, // TTS attaches to the LAST message
      }));

      setMessages(msgs);

      // TTS: read the whole combined text aloud
      if (ttsEnabled && allTexts.length > 0) {
        const lastMsgId = baseId + allTexts.length - 1;
        speakTTS(fullTtsText).then((url) => {
          setMessages((prev) => prev.map((m) => m.id === lastMsgId ? { ...m, audioUrl: url, audioLoading: false } : m));
          if (url) playAudio(url, lastMsgId);
        });
      }
    } catch {
      const fallback = lang === "es"
        ? `Hola ${employeeName?.split(" ")[0] || ""}. Empecemos. ¿Qué piensas sobre esta pregunta?`
        : `Hi ${employeeName?.split(" ")[0] || ""}. Let's start. What do you think about this question?`;
      setMessages([{ id: 1, from: "ai", text: fallback, time: now() }]);
    }
  };

  // ── ElevenLabs TTS ─────────────────────────────────────────────────────────
  const speakTTS = async (text: string): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${report.voiceId || getVoiceId(language)}`,
        {
          method: "POST",
          headers: { "Accept": "audio/mpeg", "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ text, model_id: "eleven_flash_v2_5", output_format: "mp3_44100_128" }),
        }
      );
      if (!res.ok) return null;
      return URL.createObjectURL(await res.blob());
    } catch { return null; }
  };

  const playAudio = (url: string, msgId: number) => {
    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    setSpeakingMsgId(msgId);
    setIsAudioPlaying(true);
    audio.play().then(() => {
      audio.onended = () => { setIsAudioPlaying(false); setSpeakingMsgId(null); };
    }).catch(() => { setIsAudioPlaying(false); setSpeakingMsgId(null); });
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
        message: payload,
        report_questions: reportQuestions,
        profile_summary: profileSummary,
        selected_question: chosenQuestion ? { number: chosenQuestion.number, question_text: chosenQuestion.question_text } : null,
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
        audioLoading: ttsEnabled,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (ttsEnabled) {
        speakTTS(res.aiText).then((url) => {
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
      formData.append("input_timestamp", new Date().toISOString());
      formData.append("report_questions", JSON.stringify(reportQuestions));
      formData.append("profile_summary", profileSummary || "");
      formData.append("selected_question", JSON.stringify(chosenQuestion ? { number: chosenQuestion.number, question_text: chosenQuestion.question_text } : null));
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
        audioLoading: ttsEnabled,
      }]);

      if (ttsEnabled) {
        speakTTS(aiText).then((url) => {
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
    await supabase
      .from("sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (userId && employeeId) {
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
            selected_question: chosenQuestion ? { number: chosenQuestion.number, question_text: chosenQuestion.question_text } : null,
            chat_completo: true,
          }),
        });

        if (res.ok) {
          const text = await res.text();
          if (text) {
            try {
              let json: any = JSON.parse(text);
              if (Array.isArray(json) && json[0]?.data) json = json[0].data;

              // Check if the response contains roadmap data (session-end response)
              if (json.roadmap_summary && json.objectives && Array.isArray(json.objectives)) {
                const roadmapData: RoadmapData = {
                  roadmap_summary: json.roadmap_summary,
                  objectives: json.objectives.map((obj: any) => ({
                    order: obj.order,
                    title: obj.title,
                    path_type: obj.path_type || "",
                    mountain_type: obj.mountain_type || "",
                    justification: obj.justification || "",
                  })),
                };

                // Save roadmap to DB
                await supabase.from("roadmaps").insert({
                  employee_id: employeeId,
                  session_id: sessionId,
                  roadmap_summary: roadmapData.roadmap_summary,
                  objectives: roadmapData.objectives,
                });

                onSessionEnd(roadmapData);
                return;
              }
            } catch {
              // JSON parse failed — fall through to generic handling
            }
          }
        }
      } catch {
        // Network error — fall through
      }
    }

    // If no roadmap data received, fall back to session ended UI
    // (This shouldn't normally happen, but we handle it gracefully)
    setIsEnding(false);
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    hasInit.current = false;
    autoStarted.current = false;
    autoScrollEnabled.current = false;
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
        <p style={{ fontSize: 13, color: "#867b77", maxWidth: 340, lineHeight: 1.6 }}>
          {lang === "es"
            ? "Cogniflow está generando tu roadmap personalizado con los objetivos descubiertos en esta sesión."
            : "Cogniflow is building your personalized roadmap with the objectives discovered in this session."}
        </p>
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
          {/* TTS toggle */}
          <button
            onClick={() => { if (ttsEnabled) stopAudio(); setTtsEnabled(!ttsEnabled); }}
            style={{
              marginLeft: "auto", fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer",
              border: "none", borderRadius: 999, padding: "5px 12px",
              background: ttsEnabled ? "#b1005d" : "rgba(255,255,255,0.08)",
              color: ttsEnabled ? "#fff" : "rgba(255,255,255,0.5)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5,
              transition: "background 0.2s ease, color 0.2s ease",
            }}
          >
            <i className={ttsEnabled ? "ri-volume-up-line" : "ri-volume-mute-line"} style={{ fontSize: 12 }}></i>
            {ttsEnabled ? t.voice_on : t.voice_off}
          </button>
          {/* End session — always available */}
          <button
            onClick={handleEndSession}
            disabled={isEnding}
            style={{
              fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: isEnding ? "not-allowed" : "pointer",
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