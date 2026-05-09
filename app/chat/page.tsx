import { Suspense } from "react";
import MeterHeader from "@/components/ui/meter-header";
import BottomNav from "@/components/ui/bottom-nav";
import ChatContainer from "@/components/solei/chat-container";
import ActivitySidebar from "@/components/solei/activity-sidebar";

/**
 * Chat Page — Main Solei conversation view.
 * Wrapped in Suspense because ChatContainer uses useSearchParams.
 */
export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen ambient-glow scanline-animated tech-grid lumos-chat-bg">
      <MeterHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden" style={{ position: "relative", zIndex: 1 }}>
        <Suspense>
          <ChatContainer />
        </Suspense>
        <ActivitySidebar />
      </div>
      <BottomNav />
    </div>
  );
}
