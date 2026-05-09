import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useVoiceInput — Web Speech API hook for voice-to-text.
 * Uses SpeechRecognition (Chrome, Edge, Safari) with Spanish locale.
 * Auto-stops after silence timeout. Returns interim results for live feedback.
 */

interface UseVoiceInputOptions {
  lang?: string;
  silenceTimeoutMs?: number;
  onResult?: (transcript: string) => void;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { lang = "es", silenceTimeoutMs = 8000, onResult } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Check browser support on client mount only (avoids hydration mismatch)
  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" && (
        "SpeechRecognition" in window ||
        "webkitSpeechRecognition" in window
      )
    );
  }, []);

  // Create recognition instance
  const getRecognition = useCallback(() => {
    if (!isSupported) return null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    return recognition;
  }, [isSupported, lang]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    setError(null);
    setTranscript("");
    setInterimTranscript("");

    const recognition = getRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      clearSilenceTimer();

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript(final);
        setInterimTranscript("");
        // Auto-send the final result
        if (onResultRef.current) {
          onResultRef.current(final);
        }
        stopListening();
      } else {
        setInterimTranscript(interim);
        // Reset silence timer on interim results
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, silenceTimeoutMs);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        setError("No se detectó voz. Intenta de nuevo.");
      } else if (event.error === "not-allowed") {
        setError("Permiso de micrófono denegado.");
      } else {
        setError(`Error: ${event.error}`);
      }
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
    };

    try {
      recognition.start();
      // Set silence timeout
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, silenceTimeoutMs);
    } catch (err) {
      setError("Error al iniciar reconocimiento de voz");
      setIsListening(false);
    }
  }, [isSupported, getRecognition, clearSilenceTimer, silenceTimeoutMs, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    error,
  };
}
