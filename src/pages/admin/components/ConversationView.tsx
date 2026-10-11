import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: number;
  session_id: number;
  employee_id: number;
  sent_at: string;
  input: { type: string; content: string } | null;
  output: {
    decision?: string;
    coach_message?: string;
    original_user_input?: string;
    understanding_summary?: string;
    enough_context_for_action?: boolean;
  } | null;
  has_files: boolean;
  file_types: string[] | null;
}

interface ConversationViewProps {
  sessionId: number | null;
  employeeName: string;
}

export default function ConversationView({
  sessionId,
  employeeName,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error: fetchError } = await supabase
          .from("messages")
          .select("*")
          .eq("session_id", sessionId)
          .order("sent_at", { ascending: true });

        if (fetchError) throw fetchError;
        setMessages(data || []);
      } catch (err) {
        setError("Error al cargar mensajes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [sessionId]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!sessionId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-foreground-500">
          Seleccioná una sesión para ver la conversación
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-background-200">
        <h2 className="text-sm font-semibold text-foreground-950">
          Conversación — Sesión #{sessionId}
        </h2>
        {employeeName && (
          <p className="text-xs text-foreground-600 mt-0.5">{employeeName}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-foreground-600">Cargando...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-accent-900 bg-accent-100 p-4 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className="text-sm text-foreground-500 text-center py-8">
            Sin mensajes en esta sesión
          </p>
        )}

        {!loading &&
          !error &&
          messages.map((msg, idx) => (
            <div key={msg.id} className="space-y-3">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary-500 text-background-50 dark:text-foreground-950 rounded-lg rounded-br-sm px-4 py-2.5">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.input?.content || "(sin contenido)"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 justify-end">
                    {msg.has_files && (
                      <span className="text-xs opacity-75 flex items-center gap-1">
                        <i className="ri-attachment-2 text-xs"></i>
                        {msg.file_types?.join(", ")}
                      </span>
                    )}
                    <span className="text-xs opacity-65">{formatTime(msg.sent_at)}</span>
                  </div>
                </div>
              </div>

              {/* Coach response */}
              {msg.output && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-background-100 rounded-lg rounded-bl-sm px-4 py-2.5 border border-background-200">
                    {msg.output.coach_message && (
                      <p className="text-sm text-foreground-950 whitespace-pre-wrap break-words">
                        {msg.output.coach_message}
                      </p>
                    )}
                    {msg.output.decision && (
                      <span className="inline-block mt-1.5 text-xs font-medium text-secondary-900 bg-secondary-100 px-2 py-0.5 rounded">
                        {msg.output.decision}
                      </span>
                    )}
                    {msg.output.understanding_summary && (
                      <details className="mt-2">
                        <summary className="text-xs text-foreground-500 cursor-pointer hover:text-foreground-700 whitespace-nowrap">
                          Comprensión del coach
                        </summary>
                        <p className="text-xs text-foreground-600 mt-1 bg-background-50 rounded p-2 whitespace-pre-wrap break-words">
                          {msg.output.understanding_summary}
                        </p>
                      </details>
                    )}
                    <div className="text-xs text-foreground-400 mt-1.5">
                      {formatTime(msg.sent_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}