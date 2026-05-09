"use client";

import { CheckIcon, XIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

interface ActionButtonsProps {
  onAuthorize: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

/**
 * Authorize / Reject buttons — Pixel art styled with pressed states.
 */
export default function ActionButtons({
  onAuthorize,
  onReject,
  isLoading,
}: ActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 animate-chat-bubble-in">
      <button
        id="btn-authorize"
        onClick={onAuthorize}
        disabled={isLoading}
        className="flex-1 h-11 text-xs font-semibold text-white pixel-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--color-solar-orange)" }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="font-pixel text-[10px]">{t("trade.processing" as any)}</span>
          </span>
        ) : (
          <>
            <CheckIcon size={14} color="#FFFFFF" />
            <span className="font-pixel text-[10px]">{t("trade.authorize" as any)}</span>
          </>
        )}
      </button>
      <button
        id="btn-reject"
        onClick={onReject}
        disabled={isLoading}
        className="h-11 px-6 text-xs font-medium pixel-btn disabled:opacity-50 flex items-center gap-2"
        style={{
          backgroundColor: "var(--card-bg)",
          color: "var(--foreground-secondary)",
        }}
      >
        <XIcon size={12} />
        <span className="font-pixel text-[10px]">{t("trade.reject" as any)}</span>
      </button>
    </div>
  );
}
