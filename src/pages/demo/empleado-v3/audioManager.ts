import { useEffect, useState } from "react";

const ELEVENLABS_API_KEY = "sk_862035862ac3086282afeed249e5bcacd281ebf966a2e029";

// ── Global mute state ────────────────────────────────────────────────────────
// A single shared flag so muting the assistant works across every stage
// (question selection, chat, roadmap) without each component keeping its own.
let muted = false;
const mutedListeners = new Set<() => void>();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  if (muted === value) return;
  muted = value;
  // Muting stops whatever is playing right now.
  if (value) stopAll();
  mutedListeners.forEach((listener) => listener());
}

export function toggleMuted(): void {
  setMuted(!muted);
}

export function subscribeMuted(listener: () => void): () => void {
  mutedListeners.add(listener);
  return () => {
    mutedListeners.delete(listener);
  };
}

// React hook so components re-render when the global mute changes.
export function useMuted(): boolean {
  const [value, setValue] = useState<boolean>(isMuted());
  useEffect(() => subscribeMuted(() => setValue(isMuted())), []);
  return value;
}

// ── Single-audio playback (most recent wins) ─────────────────────────────────
// There is only ever one <audio> element alive. Starting a new sound stops the
// previous one, so navigating quickly can never produce overlapping audio.
let currentAudio: HTMLAudioElement | null = null;

export function stopAll(): void {
  if (currentAudio) {
    try {
      currentAudio.onended = null;
      currentAudio.pause();
    } catch {
      // ignore — audio may already be gone
    }
    currentAudio = null;
  }
}

export function play(url: string, opts?: { onEnd?: () => void }): void {
  // Never play while muted — and never call the API in the first place.
  if (muted) {
    opts?.onEnd?.();
    return;
  }

  // Single-audio guarantee: the newest playback always wins.
  stopAll();

  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
    opts?.onEnd?.();
  };
  audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
    opts?.onEnd?.();
  });
}

// ── ElevenLabs TTS ────────────────────────────────────────────────────────────
// When muted, this returns null immediately WITHOUT calling the API, so muting
// also avoids burning ElevenLabs quota.
export async function speakTTS(text: string, voiceId: string): Promise<string | null> {
  if (muted) return null;
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_flash_v2_5",
          output_format: "mp3_44100_128",
        }),
      },
    );
    if (!res.ok) return null;
    return URL.createObjectURL(await res.blob());
  } catch {
    return null;
  }
}