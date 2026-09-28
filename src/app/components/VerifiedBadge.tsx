import { useState } from "react";
import { BadgeCheck, Shield, Check, X, Lock, Sparkles, Key } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
  interactive?: boolean;
  userName?: string;
}

export function VerifiedBadge({
  size = "sm",
  className = "",
  showTooltip = true,
  interactive = true,
  userName = "This user",
}: VerifiedBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (interactive) {
      e.stopPropagation();
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <>
      <span
        onClick={handleClick}
        title={showTooltip ? "Verified Anonymous Identity" : undefined}
        className={`inline-flex items-center justify-center text-purple-400 hover:text-purple-300 transition-transform ${
          interactive ? "cursor-pointer hover:scale-110 active:scale-95" : ""
        } ${className}`}
      >
        <span className="relative flex items-center justify-center">
          <BadgeCheck className={`${sizeClasses[size]} fill-purple-600/30 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]`} />
        </span>
      </span>

      {showModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1c1e] border border-purple-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 text-center border-b border-gray-800 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 mx-auto rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mb-3 text-purple-400 shadow-lg shadow-purple-600/30">
                <BadgeCheck className="w-8 h-8 fill-purple-500/20 text-purple-400" />
              </div>

              <h3 className="text-white font-semibold text-lg flex items-center justify-center gap-1.5">
                Verified Anon
              </h3>
              <p className="text-xs text-purple-300 mt-1 font-mono">
                {userName}
              </p>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3.5">
              <p className="text-xs text-gray-300 leading-relaxed">
                This account has successfully completed the <strong className="text-white">anoNote Multi-Step Verification</strong> process. Trust is established cryptographically without sacrificing privacy.
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5 bg-[#2c2c2e]/60 p-2.5 rounded-xl border border-gray-800">
                  <Key className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-white font-medium">Cryptographic Key Ownership</p>
                    <p className="text-gray-400 text-[11px]">Valid device signature matching public Anon key</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#2c2c2e]/60 p-2.5 rounded-xl border border-gray-800">
                  <Shield className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-white font-medium">Zero-Knowledge Anti-Sybil Proof</p>
                    <p className="text-gray-400 text-[11px]">Proof of unique entity without real ID or tracking</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#2c2c2e]/60 p-2.5 rounded-xl border border-gray-800">
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-white font-medium">100% Anonymity Preserved</p>
                    <p className="text-gray-400 text-[11px]">Zero personal data stored or exposed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-[#141416] border-t border-gray-800 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-mono">Status: Cryptographically Active</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
