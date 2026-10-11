import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { isProfileResponse, type WebhookResponse } from "@/utils/generateProfilePdf";

interface UIMessage {
  id: number;
  from: "ai" | "user";
  text: string;
  isPlaceholder?: boolean;
  time: string;
  audioUrl?: string | null;
  audioLoading?: boolean;
}

interface ChatSectionProps {
  employeeName?: string;
  employeeId?: number;
  userId?: string;
  language?: string;
  gender?: string;
}

const now = () =>
  new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

const CHAT_WEBHOOK_URL = "https://n8n.srv1091049.hstgr.cloud/webhook/5e6159d0-48a6-4745-8712-7cb411b685a0";
const ELEVENLABS_API_KEY = "sk_862035862ac3086282afeed249e5bcacd281ebf966a2e029";

const getElevenLabsVoiceId = (lang: string) =>
  lang === "en" ? "OYTbf65OHHFELVut7v2H" : "ewn5JTa3lNPY8QVuZJi6";

type ViewMode = "idle" | "loading" | "chat";

export default function ChatSection({ employeeName, employeeId, userId, language = "es", gender = "" }: ChatSectionProps) {
  const { t } = useTranslation();
  const firstName = employeeName ? employeeName.split(" ")[0] : "";
  const greeting = firstName
    ? t("chat.greeting", { name: firstName })
    : t("chat.greeting_fallback");

  // ── Loading messages (computed from translations) ────────────────────────
  const LOADING_MESSAGES = [
    t("chat.loading_1"),
    t("chat.loading_2"),
    t("chat.loading_3"),
    t("chat.loading_4"),
  ];

  // ── View mode ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("idle");
  const [error, setError] = useState<string | null>(null);

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  // ── ElevenLabs audio ───────────────────────────────────────────────────────
  const [initAudioUrl, setInitAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initAudioPlayed = useRef(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [canEndSession, setCanEndSession] = useState(false);
  const [endSessionCountdown, setEndSessionCountdown] = useState(600);
  const [reportQuestions, setReportQuestions] = useState<Array<{ number: number; question_text: string }>>([]);
  const [reportProfileSummary, setReportProfileSummary] = useState<string>("");

  // ── Stop any playing audio ────────────────────────────────────────────────
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsAudioPlaying(false);
    setSpeakingMsgId(null);
  };

  const handleRepeatAudio = () => {
    if (!initAudioUrl) return;
    stopAudio();

    const audio = new Audio(initAudioUrl);
    audioRef.current = audio;
    setSpeakingMsgId(null);
    setIsAudioPlaying(true);
    audio.play().then(() => {
      audio.onended = () => setIsAudioPlaying(false);
    }).catch(() => {
      setIsAudioPlaying(false);
    });
  };

  // ── Loading animation ────────────────────────────────────────────────────────
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitRef = useRef(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // ── Check if user already has today's session → skip idle view ────────────
  useEffect(() => {
    if (!employeeId || !userId) {
      setCheckingAccess(false);
      return;
    }

    const check = async () => {
      try {
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id")
          .eq("employee_id", employeeId)
          .is("ended_at", null)
          .order("started_at", { ascending: false })
          .limit(1);

        if (sessions && sessions.length > 0) {
          const { data: msgs } = await supabase
            .from("messages")
            .select("id")
            .eq("session_id", sessions[0].id)
            .limit(1);

          if (msgs && msgs.length > 0) {
            setViewMode("chat");
            setCheckingAccess(false);
            return;
          }
        }
      } catch {
        // fall through to idle
      }
      setCheckingAccess(false);
    };

    check();
  }, [employeeId, userId]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (initAudioUrl) URL.revokeObjectURL(initAudioUrl);
    };
  }, [initAudioUrl]);

  // Initialize session and load messages — only when entering chat mode
  useEffect(() => {
    if (viewMode !== "chat" || !employeeId || !userId || hasInitRef.current) return;
    hasInitRef.current = true;

    const init = async () => {
      setLoading(true);

      const { data: activeSessions } = await supabase
        .from("sessions")
        .select("id, started_at")
        .eq("employee_id", employeeId)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1);

      let sid: number;
      let startedAt: Date;
      if (activeSessions && activeSessions.length > 0) {
        sid = activeSessions[0].id;
        startedAt = new Date(activeSessions[0].started_at);
      } else {
        startedAt = new Date();
        const { data: newSession, error } = await supabase
          .from("sessions")
          .insert({ employee_id: employeeId, started_at: startedAt.toISOString() })
          .select("id")
          .single();

        if (error || !newSession) {
          setLoading(false);
          return;
        }
        sid = newSession.id;
      }

      if (!sessionId) setSessionId(sid);
      if (!sessionStartedAt) setSessionStartedAt(startedAt);

      // Fetch report questions & profile_summary for this employee
      const { data: reporteData } = await supabase
        .from("reportes")
        .select("questions, profile_summary")
        .eq("usuario_id", employeeId)
        .order("fecha_aplicacion", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reporteData?.questions) {
        const allQuestions = reporteData.questions as Array<{ number: number; question_text: string }>;
        const firstTwo = allQuestions
          .filter((q) => q.number === 1 || q.number === 2)
          .sort((a, b) => a.number - b.number);
        setReportQuestions(firstTwo);
      }

      if (reporteData?.profile_summary) {
        setReportProfileSummary(reporteData.profile_summary as string);
      }

      const { data: dbMessages } = await supabase
        .from("messages")
        .select("id, input, output, created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: true });

      const uiMessages: UIMessage[] = [];

      if (dbMessages) {
        for (const m of dbMessages) {
          const time = m.created_at
            ? new Date(m.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
            : now();

          const inputType = m.input?.type;
          const inputContent = m.input?.content;
          const output = m.output;

          if (inputType === "ai" && inputContent) {
            uiMessages.push({ id: Number(m.id), from: "ai", text: inputContent, time });
          } else if (inputType === "text" && inputContent) {
            uiMessages.push({ id: Number(m.id), from: "user", text: inputContent, time });

            let aiText = "";
            if (output && typeof output === "object") {
              if (isProfileResponse(output as WebhookResponse)) {
                aiText = (output as WebhookResponse).profile_summary || "";
              } else if (output.coach_message && typeof output.coach_message === "string") {
                aiText = output.coach_message;
              } else if (output.content && typeof output.content === "string") {
                aiText = output.content;
              }
            }
            if (aiText) {
              uiMessages.push({ id: Number(m.id) + 100000, from: "ai", text: aiText, time });
            }
          }
        }
      }

      if (uiMessages.length === 0) {
        uiMessages.push({ id: 1, from: "ai", text: greeting, time: now() });
      }

      setMessages(uiMessages);
      setLoading(false);
    };

    init();
  }, [viewMode, employeeId, userId, sessionId, greeting]);

  // Play ElevenLabs audio when chat opens
  useEffect(() => {
    if (viewMode === "chat" && initAudioUrl && !initAudioPlayed.current) {
      initAudioPlayed.current = true;
      const audio = new Audio(initAudioUrl);
      audioRef.current = audio;
      setIsAudioPlaying(true);
      audio.play().then(() => {
        audio.onended = () => setIsAudioPlaying(false);
      }).catch(() => {
        setIsAudioPlaying(false);
      });
    }
  }, [viewMode, initAudioUrl]);

  // ── Countdown timer for end-session button (10 min lock) ──────────────────
  useEffect(() => {
    if (!sessionStartedAt) return;

    const check = () => {
      const elapsed = Date.now() - sessionStartedAt.getTime();
      const TEN_MINUTES = 10 * 60 * 1000;
      if (elapsed >= TEN_MINUTES) {
        setCanEndSession(true);
        setEndSessionCountdown(0);
      } else {
        setCanEndSession(false);
        setEndSessionCountdown(Math.ceil((TEN_MINUTES - elapsed) / 1000));
      }
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── Start conversation: ElevenLabs TTS flow ────────────────────────────────
  const handleStartConversation = async () => {
    if (!employeeId || !userId) return;

    setError(null);
    setViewMode("loading");
    setLoadingMsgIndex(0);
    initAudioPlayed.current = false;

    // Rotating messages
    loadingTimerRef.current = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);

    try {
      // 1. Fetch profile_summary + questions
      const { data: reporte } = await supabase
        .from("reportes")
        .select("profile_summary, questions")
        .eq("usuario_id", employeeId)
        .order("fecha_aplicacion", { ascending: false })
        .limit(1)
        .maybeSingle();

      const profileSummary = reporte?.profile_summary || "";

      // Extract the first question (number === 1) from the report questions
      let firstQuestion = "";
      if (reporte?.questions) {
        const allQuestions = reporte.questions as Array<{ number: number; question_text: string }>;
        const q1 = allQuestions.find((q) => q.number === 1);
        if (q1?.question_text) {
          firstQuestion = q1.question_text;
        }
        // Also store questions in state for subsequent webhook calls
        const firstTwo = allQuestions
          .filter((q) => q.number === 1 || q.number === 2)
          .sort((a, b) => a.number - b.number);
        setReportQuestions(firstTwo);
      }

      if (reporte?.profile_summary) {
        setReportProfileSummary(reporte.profile_summary as string);
      }

      const fullText = profileSummary
        ? firstQuestion
          ? `${profileSummary}\n\n${firstQuestion}`
          : profileSummary
        : firstQuestion || t("chat.resonance_question");

      // 2. Find or create session
      const { data: activeSessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("employee_id", employeeId)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1);

      let sid: number;
      if (activeSessions && activeSessions.length > 0) {
        sid = activeSessions[0].id;
      } else {
        const { data: newSession } = await supabase
          .from("sessions")
          .insert({ employee_id: employeeId, started_at: new Date().toISOString() })
          .select("id")
          .single();

        if (!newSession) {
          throw new Error("No se pudo crear la sesión");
        }
        sid = newSession.id;
      }

      setSessionId(sid);

      // 3. Save AI message to DB
      await supabase.from("messages").insert({
        session_id: sid,
        employee_id: employeeId,
        input: { type: "ai", content: fullText },
        sent_at: new Date().toISOString(),
      });

      // 4. Call ElevenLabs TTS — following official guide format exactly
      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${getElevenLabsVoiceId(language)}`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: fullText,
            model_id: "eleven_flash_v2_5",
            output_format: "mp3_44100_128",
          }),
        }
      );

      if (!ttsResponse.ok) {
        let errorMsg = `Error ${ttsResponse.status}`;
        try {
          const errData = await ttsResponse.json();
          if (errData?.detail?.message) {
            errorMsg = errData.detail.message;
          } else if (errData?.detail) {
            errorMsg = String(errData.detail);
          } else if (errData?.message) {
            errorMsg = errData.message;
          }
        } catch {
          // ignore JSON parse error
        }
        throw new Error(`ElevenLabs: ${errorMsg}`);
      }

      const audioBlob = await ttsResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setInitAudioUrl(url);

      stopLoadingAndOpenChat();
    } catch (err: any) {
      console.error("handleStartConversation error:", err);
      setError(err?.message || "Ocurrió un error al iniciar la conversación");
      stopLoadingAndOpenChat();
    }
  };

  const stopLoadingAndOpenChat = () => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setViewMode("chat");
  };

  // ── Save message to DB ─────────────────────────────────────────────────────
  const saveMessageToDB = async (
    type: "text" | "ai",
    content: string,
    output?: WebhookResponse
  ) => {
    if (!sessionId || !employeeId) return null;

    const payload: Record<string, unknown> = {
      session_id: sessionId,
      employee_id: employeeId,
      input: { type, content },
      sent_at: new Date().toISOString(),
    };

    if (output && Object.keys(output).length > 0) {
      payload.output = output;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return null;
    }
    return data?.id ?? null;
  };

  const saveReportToDb = async (data: Record<string, unknown>) => {
    if (!employeeId) return;

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("reportes")
      .select("id")
      .eq("usuario_id", employeeId)
      .order("fecha_aplicacion", { ascending: false })
      .limit(1);

    const step1 = (data.step1_scores || {}) as Record<string, { direction?: string; clarity?: string; score?: number }>;

    const payload: Record<string, unknown> = {
      usuario_id: employeeId,
      fecha_aplicacion: today,
      tipo_reportado: (data.mbti_type || data.reported_type || null) as string | null,
      individualized_type_label: (data.individualized_type_label || null) as string | null,
      pci_extraversion: step1.EI?.score ?? null,
      pci_intuition: step1.SN?.score ?? null,
      pci_feeling: step1.TF?.score ?? null,
      pci_perceiving: step1.JP?.score ?? null,
      polarity_index: (data.polarity_index ?? null) as number | null,
      omitted_responses: (data.omitted_responses ?? null) as number | null,
      profile_name: (data.profile_name || null) as string | null,
      mbti_type: (data.mbti_type || null) as string | null,
      profile_summary: (data.profile_summary || null) as string | null,
      questions: (data.questions || null) as unknown[] | null,
      one_thing_worth_noticing: (data.one_thing_worth_noticing || null) as string | null,
      coaching_note: (data.coaching_note || null) as string | null,
    };

    if (existing && existing.length > 0) {
      await supabase.from("reportes").update(payload).eq("id", existing[0].id);
    } else {
      await supabase.from("reportes").insert(payload);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    stopAudio();

    // Enviar señal de cierre al webhook con chat_completo: true
    if (userId && employeeId) {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);
      const messageNumber = (count ?? 0) + 1;

      fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          employee_id: employeeId,
          language: language,
          employee_name: employeeName || "",
          gender: gender || "",
          message_number: messageNumber,
          input_timestamp: new Date().toISOString(),
          message: { type: "session_end", content: "" },
          report_questions: reportQuestions,
          profile_summary: reportProfileSummary,
          chat_completo: true,
        }),
      }).catch(() => {
        // noop — no bloquear el cierre de sesión si falla el webhook
      });
    }

    await supabase
      .from("sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", sessionId);
    setSessionEnded(true);
  };

  const handleNewSession = () => {
    setSessionEnded(false);
    setViewMode("idle");
    setMessages([]);
    setSessionId(null);
    hasInitRef.current = false;
    setSessionStartedAt(null);
    setCanEndSession(false);
    setEndSessionCountdown(600);
    setReportQuestions([]);
    setReportProfileSummary("");
  };

  // ── ElevenLabs TTS for chat messages ──────────────────────────────────────
  const speakWithElevenLabs = async (text: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${getElevenLabsVoiceId(language)}`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_flash_v2_5",
            output_format: "mp3_44100_128",
          }),
        }
      );
      if (!response.ok) return null;
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  };

  // ── Play an audio URL as chat TTS ─────────────────────────────────────────
  const playMessageAudio = (url: string, msgId: number) => {
    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    setSpeakingMsgId(msgId);
    setIsAudioPlaying(true);
    audio.play().then(() => {
      audio.onended = () => {
        setIsAudioPlaying(false);
        setSpeakingMsgId(null);
      };
    }).catch(() => {
      setIsAudioPlaying(false);
      setSpeakingMsgId(null);
    });
  };

  const sendToWebhook = async (messagePayload: {
    type: string;
    content: string;
    mime_type?: string;
  }): Promise<{
    userText: string;
    aiText: string;
    fullResponse: WebhookResponse;
    isProfile?: boolean;
  } | null> => {
    if (!sessionId || !employeeId || !userId) return null;

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);
    const messageNumber = (count ?? 0) + 1;

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
        message_number: messageNumber,
        input_timestamp: new Date().toISOString(),
        message: messagePayload,
        report_questions: reportQuestions,
        profile_summary: reportProfileSummary,
        chat_completo: false,
      }),
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text) return null;

    try {
      let json: any = JSON.parse(text);

      if (Array.isArray(json) && json.length > 0 && json[0]?.data) {
        json = json[0].data;
      }

      if (isProfileResponse(json)) {
        return {
          userText: messagePayload.content,
          aiText: json.profile_summary,
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

      const userText =
        json.original_user_input ||
        json.user_message ||
        messagePayload.content;
      const aiText =
        json.coach_message ||
        json.response ||
        json.message ||
        json.text ||
        json.content ||
        json.output ||
        json.reply ||
        "";

      if (userText && aiText) {
        return {
          userText: String(userText),
          aiText: String(aiText),
          fullResponse: json,
        };
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !sessionId || !employeeId || !userId || isTyping) return;

    const userMsg: UIMessage = { id: Date.now(), from: "user", text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const webhookRes = await sendToWebhook({ type: "text", content: text });

    if (webhookRes) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMsg.id ? { ...m, text: webhookRes.userText } : m
        )
      );

      await saveMessageToDB("text", webhookRes.userText, webhookRes.fullResponse);

      if (webhookRes.isProfile) {
        await saveReportToDb(webhookRes.fullResponse as Record<string, unknown>);
      }

      const aiMsgId = Date.now() + 1;
      const aiMsg: UIMessage = {
        id: aiMsgId,
        from: "ai",
        text: webhookRes.aiText,
        time: now(),
        audioLoading: ttsEnabled,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (ttsEnabled && webhookRes.aiText) {
        speakWithElevenLabs(webhookRes.aiText).then((audioUrl) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, audioUrl, audioLoading: false } : m
            )
          );
          if (audioUrl) {
            playMessageAudio(audioUrl, aiMsgId);
          }
        });
      }
    } else {
      await saveMessageToDB("text", text);

      const fallbackMsg: UIMessage = {
        id: Date.now() + 1,
        from: "ai",
        text: t("chat.fallback_reply"),
        time: now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }

    setIsTyping(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalMime = mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        handleAudioSend(blob, finalMime);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.onerror = () => {
        setAudioError("Error al grabar audio");
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      setAudioError("No se pudo acceder al micrófono");
      setIsRecording(false);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // ── Send audio blob directly to webhook as raw file (multipart/form-data) ──
  const handleAudioSend = async (blob: Blob, mimeType: string) => {
    if (!sessionId || !employeeId || !userId) return;

    setIsTyping(true);

    const tempId = Date.now();
    const placeholderMsg: UIMessage = {
      id: tempId,
      from: "user",
      text: `🎙 ${t("chat.audio_sending")}`,
      isPlaceholder: true,
      time: now(),
    };
    setMessages((prev) => [...prev, placeholderMsg]);

    const cleanupAndFallback = async (aiFallbackKey: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      const userMsg: UIMessage = {
        id: Date.now(),
        from: "user",
        text: t("chat.audio_placeholder"),
        time: now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      await saveMessageToDB("text", t("chat.audio_placeholder"));
      const aiMsg: UIMessage = {
        id: Date.now() + 1,
        from: "ai",
        text: t(aiFallbackKey),
        time: now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    };

    try {
      const fileExt = mimeType.includes("webm") ? "webm"
        : mimeType.includes("mp4") ? "mp4"
        : mimeType.includes("ogg") ? "ogg"
        : "webm";

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("session_id", String(sessionId));
      formData.append("employee_id", String(employeeId));
      formData.append("language", language);
      formData.append("employee_name", employeeName || "");
      formData.append("gender", gender || "");
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);
      const messageNumber = (count ?? 0) + 1;
      formData.append("message_number", String(messageNumber));
      formData.append("input_timestamp", new Date().toISOString());
      formData.append("report_questions", JSON.stringify(reportQuestions));
      formData.append("profile_summary", reportProfileSummary);
      formData.append("chat_completo", "false");
      formData.append("audio", blob, `audio.${fileExt}`);

      const res = await fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        await cleanupAndFallback("chat.audio_no_transcribe");
        setIsTyping(false);
        return;
      }

      const text = await res.text();
      if (!text) {
        await cleanupAndFallback("chat.audio_no_transcribe");
        setIsTyping(false);
        return;
      }

      let json: any;
      try {
        json = JSON.parse(text);
        if (Array.isArray(json) && json.length > 0 && json[0]?.data) {
          json = json[0].data;
        }
      } catch {
        await cleanupAndFallback("chat.audio_no_transcribe");
        setIsTyping(false);
        return;
      }

      const isProfile = isProfileResponse(json);
      let userText = "";
      let aiText = "";

      if (isProfile) {
        userText = json.original_user_input || t("chat.audio_placeholder");
        aiText = json.profile_summary || "";
      } else if (json.original_user_input && json.coach_message) {
        userText = String(json.original_user_input);
        aiText = String(json.coach_message);
      } else {
        userText =
          json.original_user_input ||
          json.user_message ||
          t("chat.audio_placeholder");
        aiText =
          json.coach_message ||
          json.response ||
          json.message ||
          json.text ||
          json.content ||
          json.output ||
          json.reply ||
          "";
      }

      if (!aiText) {
        await cleanupAndFallback("chat.audio_no_transcribe");
        setIsTyping(false);
        return;
      }

      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      const userMsg: UIMessage = {
        id: Date.now(),
        from: "user",
        text: String(userText),
        time: now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      await saveMessageToDB("text", String(userText), json);

      if (isProfile) {
        await saveReportToDb(json as Record<string, unknown>);
      }

      const aiMsgId = Date.now() + 1;
      const aiMsg: UIMessage = {
        id: aiMsgId,
        from: "ai",
        text: aiText,
        time: now(),
        audioLoading: ttsEnabled,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (ttsEnabled && aiText) {
        speakWithElevenLabs(aiText).then((audioUrl) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, audioUrl, audioLoading: false } : m
            )
          );
          if (audioUrl) {
            playMessageAudio(audioUrl, aiMsgId);
          }
        });
      }
    } catch {
      await cleanupAndFallback("chat.audio_failed");
    }

    setIsTyping(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── IDLE VIEW ──────────────────────────────────────────────────────────────
  if (viewMode === "idle") {
    if (checkingAccess) {
      return (
        <div
          className="flex flex-col items-center justify-center rounded-3xl bg-white flex-1"
          style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: "#EDE9FE" }}
          >
            <i className="ri-brain-line text-lg" style={{ color: "#7C3AED" }}></i>
          </div>
          <p className="text-sm text-gray-400 mt-3">{t("chat.preparing")}</p>
        </div>
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white flex-1 gap-8"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        {/* Icon */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}
          >
            <i className="ri-brain-line text-white text-3xl"></i>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
            <i className="ri-volume-up-line text-sm" style={{ color: "#7C3AED" }}></i>
          </div>
        </div>

        {/* Text */}
        <div className="text-center px-6 max-w-sm">
          <h3 className="text-lg font-bold text-black mb-2">
            {firstName ? t("chat.guide_waits", { name: firstName }) : t("chat.guide_waits_fallback")}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t("chat.guide_subtitle")}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleStartConversation}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white cursor-pointer whitespace-nowrap transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            boxShadow: "0 4px 24px rgba(124,58,237,0.25)",
          }}
        >
          <i className="ri-play-circle-line text-xl"></i>
          {t("chat.start_conversation")}
        </button>
      </div>
    );
  }

  // ── LOADING VIEW ───────────────────────────────────────────────────────────
  if (viewMode === "loading") {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white flex-1 gap-6"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        {error ? (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-50">
              <i className="ri-error-warning-line text-xl text-red-500"></i>
            </div>
            <p className="text-sm font-medium text-red-600 max-w-xs">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                setViewMode("idle");
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-all hover:opacity-90"
              style={{ backgroundColor: "#7C3AED" }}
            >
              {t("chat.retry")}
            </button>
          </div>
        ) : (
          <>
            {/* Spinner */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
              <div
                className="absolute inset-0 rounded-full border-4 animate-spin"
                style={{
                  borderTopColor: "#7C3AED",
                  borderRightColor: "transparent",
                  borderBottomColor: "transparent",
                  borderLeftColor: "transparent",
                }}
              />
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#EDE9FE" }}
              >
                <i className="ri-brain-line text-lg" style={{ color: "#7C3AED" }}></i>
              </div>
            </div>

            {/* Rotating messages */}
            <div className="flex flex-col items-center gap-1">
              <p
                key={loadingMsgIndex}
                className="text-base font-semibold text-black transition-all duration-500"
                style={{ animation: "fadeSlideIn 0.5s ease" }}
              >
                {LOADING_MESSAGES[loadingMsgIndex]}
              </p>
              <p className="text-xs text-gray-400">{t("chat.loading_subtitle")}</p>
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
          </>
        )}
      </div>
    );
  }

  // ── CHAT VIEW ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white flex-1"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
          style={{ backgroundColor: "#EDE9FE" }}
        >
          <i className="ri-brain-line text-lg" style={{ color: "#7C3AED" }}></i>
        </div>
        <p className="text-sm text-gray-400 mt-3">{t("chat.loading")}</p>
      </div>
    );
  }

  if (sessionEnded) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl bg-white flex-1 gap-6"
        style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-50">
          <i className="ri-check-line text-2xl text-green-500"></i>
        </div>
        <div className="text-center px-6 max-w-sm">
          <h3 className="text-lg font-bold text-black mb-2">
            {t("chat.session_ended_title")}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {t("chat.session_ended_desc")}
          </p>
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white cursor-pointer whitespace-nowrap transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            boxShadow: "0 4px 24px rgba(124,58,237,0.25)",
          }}
        >
          <i className="ri-play-circle-line text-xl"></i>
          {t("chat.new_session")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-3xl overflow-hidden bg-white flex-1"
      style={{ border: "1px solid #F3F4F6", minHeight: "460px" }}
    >
      {/* Chat header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}
        >
          <i className="ri-brain-line text-white text-base"></i>
        </div>
        <div>
          <p className="text-sm font-bold text-black">{t("chat.companion")}</p>
          <div className="flex items-center gap-1.5">
            {isAudioPlaying ? (
              <>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#F59E0B" }}></span>
                <span className="text-xs" style={{ color: "#D97706" }}>{t("chat.speaking")}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs text-gray-400">{t("chat.online")}</span>
              </>
            )}
          </div>
        </div>
        {initAudioUrl && (
          <button
            onClick={handleRepeatAudio}
            disabled={isAudioPlaying}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all disabled:opacity-50"
            style={{
              backgroundColor: isAudioPlaying ? "#FEF3C7" : "#F3F4F6",
              color: isAudioPlaying ? "#D97706" : "#6B7280",
            }}
            title="Repetir audio inicial"
          >
            <i className={`text-xs ${isAudioPlaying ? "ri-volume-up-line" : "ri-volume-up-line"}`}></i>
            {isAudioPlaying ? t("chat.playing") : t("chat.listen")}
          </button>
        )}
        {/* TTS Toggle */}
        <button
          onClick={() => {
            if (ttsEnabled) stopAudio();
            setTtsEnabled(!ttsEnabled);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all"
          style={{
            backgroundColor: ttsEnabled ? "#ECFDF5" : "#F3F4F6",
            color: ttsEnabled ? "#059669" : "#9CA3AF",
          }}
          title={ttsEnabled ? "Voz activada — clic para desactivar" : "Voz desactivada — clic para activar"}
        >
          <i className={`text-xs ${ttsEnabled ? "ri-volume-up-line" : "ri-volume-mute-line"}`}></i>
          {ttsEnabled ? t("chat.voice_on") : t("chat.voice_off")}
        </button>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
        >
          {t("chat.session_today")}
        </div>
        {canEndSession ? (
          <button
            onClick={handleEndSession}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all ml-auto"
            style={{
              backgroundColor: "#ECFDF5",
              color: "#059669",
            }}
            title={t("chat.end_session")}
          >
            <i className="ri-check-double-line text-xs"></i>
            {t("chat.end_session")}
          </button>
        ) : (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ml-auto"
            style={{
              backgroundColor: "#FFF7ED",
              color: "#EA580C",
              cursor: "not-allowed",
              opacity: 0.85,
            }}
            title={t("chat.end_session_locked")}
          >
            <i className="ri-timer-line text-xs"></i>
            {formatCountdown(endSessionCountdown)}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ maxHeight: "340px" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.from === "ai" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}
              >
                <i className="ri-brain-line text-white text-xs"></i>
              </div>
            )}
            <div
              className="max-w-xs md:max-w-md rounded-2xl px-4 py-3"
              style={{
                backgroundColor: msg.from === "ai" ? "#F9F6FF" : "#7C3AED",
                color: msg.from === "ai" ? "#1F2937" : "white",
                borderBottomLeftRadius: msg.from === "ai" ? "4px" : "16px",
                borderBottomRightRadius: msg.from === "user" ? "4px" : "16px",
                opacity: msg.isPlaceholder ? 0.7 : 1,
              }}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              {/* ── Audio controls for AI messages ── */}
              {msg.from === "ai" && msg.audioLoading && (
                <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "#A78BFA" }}>
                  <i className="ri-loader-4-line animate-spin text-xs"></i>
                  <span>{t("chat.generating_audio")}</span>
                </div>
              )}
              {msg.from === "ai" && msg.audioUrl && !msg.audioLoading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (msg.audioUrl) playMessageAudio(msg.audioUrl, msg.id);
                  }}
                  className="flex items-center gap-1 mt-2 text-xs font-medium px-2 py-1 rounded-full cursor-pointer transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: speakingMsgId === msg.id ? "#FEF3C7" : "#F3F4F6",
                    color: speakingMsgId === msg.id ? "#D97706" : "#7C3AED",
                  }}
                >
                  <i className={`text-xs ${speakingMsgId === msg.id ? "ri-volume-up-line" : "ri-play-circle-line"}`}></i>
                  {speakingMsgId === msg.id ? t("chat.playing") : t("chat.listen")}
                </button>
              )}
              <p
                className="text-xs mt-1.5 text-right"
                style={{ color: msg.from === "ai" ? "#9CA3AF" : "rgba(255,255,255,0.6)" }}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}
            >
              <i className="ri-brain-line text-white text-xs"></i>
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-1"
              style={{ backgroundColor: "#F9F6FF", borderBottomLeftRadius: "4px" }}
            >
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "#A78BFA", animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "#A78BFA", animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "#A78BFA", animationDelay: "300ms" }}
              ></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100">
        {audioError && (
          <p className="text-xs text-red-500 mb-2">{audioError}</p>
        )}
        {isRecording && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-red-50">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-medium text-red-600">{t("chat.recording")} {formatTime(recordingTime)}</span>
            <button
              onClick={stopRecording}
              className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-red-500 text-white cursor-pointer"
            >
              {t("chat.stop")}
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTyping}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 flex-shrink-0"
            style={{
              backgroundColor: isRecording ? "#EF4444" : "#E5E7EB",
            }}
            title={isRecording ? "Detener grabación" : "Grabar audio"}
          >
            <i
              className={`${isRecording ? "ri-stop-fill" : "ri-mic-line"} text-sm`}
              style={{ color: isRecording ? "white" : "#6B7280" }}
            ></i>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={isRecording ? t("chat.recording_audio") : t("chat.placeholder")}
            disabled={isRecording || isTyping}
            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isRecording}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 flex-shrink-0"
            style={{ backgroundColor: "#7C3AED" }}
          >
            <i className="ri-send-plane-fill text-white text-sm"></i>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          {t("chat.privacy")}
        </p>
      </div>
    </div>
  );
}