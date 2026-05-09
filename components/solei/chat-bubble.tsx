"use client";

import type { SoleiMessage } from "@/lib/types";
import { SunIcon } from "@/components/ui/pixel-icons";

interface ChatBubbleProps {
  message: SoleiMessage;
  isStreaming?: boolean;
}

/**
 * Lightweight markdown → HTML for chat bubbles.
 * Handles: **bold**, *italic*, bullet lists, numbered lists, line breaks.
 */
function renderMarkdown(text: string): string {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-solar-yellow)">$1</strong>')
    .replace(/__(.+?)__/g, '<strong style="color:var(--color-solar-yellow)">$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Bullet lists: - item or * item at line start
    .replace(/^[-*]\s+(.+)$/gm, '<div style="padding-left:12px">• $1</div>')
    // Numbered lists: 1. item
    .replace(/^\d+\.\s+(.+)$/gm, '<div style="padding-left:12px">→ $1</div>')
    // Line breaks
    .replace(/\n/g, "<br/>");
}

/**
 * Chat bubble — Pixel art styled.
 * Solei: pixel-bordered left bubble with sun sprite avatar.
 * User: pixel-bordered right bubble with accent color.
 */
export default function ChatBubble({ message, isStreaming }: ChatBubbleProps) {
  const isSolei = message.role === "assistant";

  if (isSolei) {
    return (
      <div className="flex items-start gap-2.5 max-w-[85%] animate-chat-bubble-in">
        {/* Solei pixel avatar */}
        <div
          className="w-9 h-9 flex items-center justify-center shrink-0 pixel-border"
          style={{
            backgroundColor: "var(--color-solar-orange)",
            "--pixel-border-color": "var(--color-solar-yellow)",
          } as React.CSSProperties}
        >
          <SunIcon size={20} color="#FFFFFF" />
        </div>
        {/* Message bubble */}
        <div
          className="pixel-card fresnel-card px-4 py-2.5 text-xs leading-relaxed"
          style={{
            backgroundColor: "var(--chat-bubble-ai)",
            color: "var(--chat-text-ai)",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            {message.content ? (
              <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
            ) : isStreaming ? (
              <span className="inline-flex items-center gap-1 font-pixel text-[9px]" style={{ color: "var(--color-solar-orange)" }}>
                <span className="animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }}>●</span>
              </span>
            ) : null}
            {isStreaming && message.content && (
              <span
                className="inline-block w-2 h-4 ml-1 align-text-bottom animate-blink-cursor"
                style={{
                  backgroundColor: "var(--color-solar-orange)",
                  imageRendering: "pixelated",
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // User bubble
  return (
    <div className="flex justify-end animate-chat-bubble-in">
      <div
        className="max-w-[75%] pixel-card fresnel-card px-4 py-2.5 text-xs leading-relaxed"
        style={{
          backgroundColor: "var(--color-deep-green)",
          color: "white",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

