"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { SunIcon, CheckIcon, BoltIcon } from "@/components/ui/pixel-icons";

type ToastType = "success" | "error" | "info" | "energy";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICON_MAP: Record<ToastType, { Icon: typeof SunIcon; color: string }> = {
  success: { Icon: CheckIcon, color: "#22C55E" },
  error: { Icon: BoltIcon, color: "#EF4444" },
  info: { Icon: BoltIcon, color: "#3B82F6" },
  energy: { Icon: SunIcon, color: "#F97316" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-2" style={{ maxWidth: "320px" }}>
        {toasts.map((toast) => {
          const { Icon, color } = ICON_MAP[toast.type];
          return (
            <div
              key={toast.id}
              className={`pixel-card px-4 py-3 flex items-center gap-3 ${toast.exiting ? "toast-exit" : "toast-enter"}`}
              style={{ backgroundColor: "var(--card-bg)", border: `2px solid ${color}` }}
            >
              <div className="w-8 h-8 flex items-center justify-center pixel-border flex-shrink-0"
                style={{ backgroundColor: color, "--pixel-border-color": color } as React.CSSProperties}>
                <Icon size={16} color="#FFFFFF" />
              </div>
              <span className="text-[9px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
