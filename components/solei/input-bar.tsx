"use client";

import { useState, useRef, type FormEvent } from "react";
import { SendIcon, MicIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";
import { useVoiceInput } from "@/hooks/use-voice-input";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

/**
 * Chat input bar — Pixel art styled with voice-to-trade microphone.
 * Pressing the mic button activates Web Speech API for voice commands.
 */
export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useTranslation();

  const { isListening, interimTranscript, isSupported, startListening, stopListening, error } =
    useVoiceInput({
      lang: lang === "es" ? "es-CR" : "en-US",
      silenceTimeoutMs: 8000,
      onResult: (finalTranscript) => {
        if (finalTranscript.trim() && !disabled) {
          onSend(finalTranscript.trim());
          setText("");
        }
      },
    });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  }

  function handleMicClick() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // Show interim transcript in the input while listening
  const displayValue = isListening && interimTranscript ? interimTranscript : text;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 px-4 py-3 border-t-0"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(12px)",
        borderTop: "2px solid var(--card-border)",
      }}
    >
      <div
        className={`flex-1 flex items-center h-11 px-4 pixel-border ${isListening ? "voice-listening-border" : ""}`}
        style={{
          backgroundColor: "var(--input-bg)",
          "--pixel-border-color": isListening ? "var(--color-solar-orange)" : "var(--input-border)",
        } as React.CSSProperties}
      >
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          value={displayValue}
          onChange={(e) => {
            if (!isListening) setText(e.target.value);
          }}
          placeholder={isListening ? "🎤 Escuchando..." : t("chat.placeholder")}
          disabled={disabled || isListening}
          className={`flex-1 bg-transparent outline-none text-xs ${isListening ? "voice-interim-text" : ""}`}
          style={{ color: isListening ? "var(--color-solar-orange)" : "var(--input-text)" }}
          autoComplete="off"
        />
        {/* Voice mic button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className={`ml-2 transition-all cursor-pointer ${isListening ? "voice-pulse" : "opacity-50 hover:opacity-80"}`}
            title={isListening ? "Detener" : t("chat.voice_soon")}
            style={isListening ? { color: "var(--color-solar-orange)" } : undefined}
          >
            <MicIcon size={14} color={isListening ? "#F97316" : undefined} />
          </button>
        )}
      </div>

      {/* Pixel send button */}
      <button
        id="btn-send"
        type="submit"
        disabled={disabled || (!text.trim() && !isListening)}
        className="w-11 h-11 flex items-center justify-center text-white pixel-btn disabled:opacity-40"
        style={{ backgroundColor: "var(--color-solar-orange)" }}
      >
        <SendIcon size={18} color="#FFFFFF" />
      </button>

      {/* Voice error tooltip */}
      {error && (
        <div
          className="absolute bottom-full left-4 mb-2 px-3 py-1.5 font-pixel text-[8px] animate-fade-in-up"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.9)",
            color: "white",
          }}
        >
          {error}
        </div>
      )}
    </form>
  );
}
