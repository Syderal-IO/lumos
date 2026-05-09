"use client";

import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast-provider";
import OnboardingOverlay from "@/components/ui/onboarding";
import SolanaWalletProvider from "@/components/ui/solana-wallet-provider";

/**
 * Client-side providers wrapper.
 * Combines Solana Wallet + I18n + Toast into a single client boundary.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SolanaWalletProvider>
      <I18nProvider>
        <ToastProvider>
          {children}
          <OnboardingOverlay />
        </ToastProvider>
      </I18nProvider>
    </SolanaWalletProvider>
  );
}
