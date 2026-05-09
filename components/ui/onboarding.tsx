"use client";

import { useState, useEffect } from "react";

/**
 * #12 Onboarding Tutorial — 4-step tooltip-guided walkthrough.
 * Shows only once (localStorage flag).
 */
const STEPS = [
  {
    target: "meter-header",
    icon: "⚡",
    title: "Tu Medidor Solar",
    text: "Aquí ves tu producción en tiempo real, excedente disponible y precio actual.",
  },
  {
    target: "nav-chat",
    icon: "💬",
    title: "Habla con Solei",
    text: "Tu agente IA te ayuda a vender excedente solar a tus vecinos.",
  },
  {
    target: "nav-map",
    icon: "🗺️",
    title: "Red Vecinal",
    text: "Explora el mapa de tu microred y ve los nodos de energía.",
  },
  {
    target: "nav-stats",
    icon: "📊",
    title: "Estadísticas",
    text: "Revisa tus ganancias, logros, y racha diaria.",
  },
];

export default function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("gl-onboarding-done");
    if (!done) {
      // Delay to let the page render
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("gl-onboarding-done", "true");
      setVisible(false);
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("gl-onboarding-done", "true");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[99997] flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="pixel-card p-5 w-full max-w-xs text-center"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "2px solid var(--color-solar-orange)",
          boxShadow: "0 0 40px rgba(249, 115, 22, 0.2)",
        }}
      >
        {/* Icon */}
        <div className="text-3xl mb-3">{current.icon}</div>

        {/* Title */}
        <h3 className="font-pixel text-[10px] font-bold mb-2" style={{ color: "var(--color-solar-orange)" }}>
          {current.title}
        </h3>

        {/* Text */}
        <p className="font-pixel text-[7px] leading-relaxed mb-4" style={{ color: "var(--foreground-secondary)" }}>
          {current.text}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 transition-all"
              style={{
                backgroundColor: i === step ? "var(--color-solar-orange)" : "var(--background-secondary)",
                transform: i === step ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="flex-1 py-1.5 font-pixel text-[8px] cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--background-secondary)",
              color: "var(--foreground-secondary)",
            }}
          >
            Saltar
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-1.5 font-pixel text-[8px] font-bold cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--color-solar-orange)",
              color: "white",
            }}
          >
            {isLast ? "¡Empezar!" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}
