import { useState, useEffect } from "react";
import { ShieldCheck, Fingerprint, RefreshCw } from "lucide-react";
import { authenticateBiometrics } from "../services/biometricService";

interface BiometricLockOverlayProps {
  onUnlock: () => void;
}

export function BiometricLockOverlay({ onUnlock }: BiometricLockOverlayProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const triggerAuth = async () => {
    setError(null);
    setIsAuthenticating(true);
    try {
      const success = await authenticateBiometrics();
      if (success) {
        onUnlock();
      } else {
        setError("Biometric verification canceled or failed. Tap to try again.");
      }
    } catch (e: any) {
      setError(e?.message || "Biometric unlock failed.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Auto trigger authentication on load
  useEffect(() => {
    // Wait slightly for app mounting layout to stabilize before initiating OS prompt
    const timer = setTimeout(() => {
      triggerAuth();
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0b141a] z-[9999] flex flex-col items-center justify-center p-6 text-[#e9edef] font-sans">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        {/* Secure E2EE Header Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#0084ff]/10 border border-[#0084ff]/20 flex items-center justify-center mb-6 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-[#0084ff]" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-[#e9edef] mb-2">
          AnoNote Locked
        </h1>
        <p className="text-sm text-[#8696a0] max-w-xs mb-10 leading-relaxed">
          Biometric app-lock is enabled to secure your private end-to-end encrypted chats.
        </p>

        {/* Biometric Interactive Trigger */}
        <button
          onClick={triggerAuth}
          disabled={isAuthenticating}
          className={`w-24 h-24 rounded-full border border-dashed border-[#0084ff]/30 flex items-center justify-center transition-all duration-300 relative group cursor-pointer ${
            isAuthenticating
              ? "scale-95 bg-[#0084ff]/10 animate-pulse"
              : "hover:scale-105 hover:bg-[#0084ff]/5 hover:border-[#0084ff]/60"
          }`}
          title="Verify Biometrics"
        >
          <Fingerprint className={`w-12 h-12 transition-transform ${isAuthenticating ? "text-[#0084ff] rotate-12" : "text-[#8696a0] group-hover:text-[#0084ff]"}`} />
        </button>

        <span className="text-xs text-[#8696a0] font-medium tracking-wide uppercase mt-4">
          {isAuthenticating ? "Verifying..." : "Tap to Unlock"}
        </span>

        {/* Error Feedback */}
        {error && (
          <div className="mt-8 px-4 py-2 bg-[#f15c6d]/10 border border-[#f15c6d]/20 rounded-xl text-xs text-[#f15c6d] flex items-center gap-2 max-w-xs leading-normal">
            <span>⚠️</span>
            <p className="flex-1 text-left font-medium">{error}</p>
          </div>
        )}

        {/* Manual Button */}
        {!isAuthenticating && (
          <button
            onClick={triggerAuth}
            className="mt-12 flex items-center gap-2 text-xs font-semibold text-[#0084ff] hover:text-[#38bdf8] bg-[#202c33]/40 border border-[#2a3942]/50 hover:bg-[#202c33] transition-colors py-2 px-4 rounded-full cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Use Biometrics</span>
          </button>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-8 text-[11px] text-[#8696a0] flex flex-col items-center gap-1">
        <p className="font-semibold text-[#e9edef] opacity-80">AnoNote Security Shield</p>
        <p>Local Encrypted Biometrics Sandbox</p>
      </footer>
    </div>
  );
}
