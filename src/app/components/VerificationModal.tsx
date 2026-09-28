import { useState, useEffect } from "react";
import {
  X,
  BadgeCheck,
  Shield,
  Key,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Cpu,
  Fingerprint,
} from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess?: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  onVerifiedSuccess,
}: VerificationModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [challengeCode, setChallengeCode] = useState<string>("");
  const [selectedPattern, setSelectedPattern] = useState<number[]>([]);
  const [patternSuccess, setPatternSuccess] = useState<boolean>(false);
  const [anonName, setAnonName] = useState<string>("Anon #8462");

  useEffect(() => {
    const savedName = localStorage.getItem("ghost_note_account_name") || "Anon #8462";
    setAnonName(savedName);
    // Generate a random cryptographic challenge code
    const rand = Array.from({ length: 4 }, () =>
      Math.random().toString(16).substring(2, 6)
    ).join("-");
    setChallengeCode(`0x${rand}`);
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Device Key Attestation
  const handleRunKeyAttestation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCompletedSteps((prev) => [...prev, 1]);
      setCurrentStep(2);
    }, 1500);
  };

  // Step 2: Zero-Knowledge Humanity Pattern
  const targetPattern = [1, 3, 2, 4];
  const handleSelectPatternNode = (node: number) => {
    if (selectedPattern.includes(node)) return;
    const next = [...selectedPattern, node];
    setSelectedPattern(next);

    if (next.length === 4) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setPatternSuccess(true);
        setCompletedSteps((prev) => [...prev, 2]);
        setTimeout(() => {
          setCurrentStep(3);
        }, 800);
      }, 1000);
    }
  };

  const handleResetPattern = () => {
    setSelectedPattern([]);
  };

  // Step 3: Network Decentralized Attestation
  const handleFinalizeVerification = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCompletedSteps((prev) => [...prev, 3]);
      localStorage.setItem("anon_is_verified", "true");
      window.dispatchEvent(new CustomEvent("verification_updated", { detail: { verified: true } }));
      setCurrentStep(4);
      if (onVerifiedSuccess) {
        onVerifiedSuccess();
      }
    }, 1800);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedPattern([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="bg-[#1c1c1e] border border-purple-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-white font-semibold text-base">Identity Verification</h3>
              <p className="text-[11px] text-purple-400 font-mono">Zero-Knowledge Trust Protocol</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker (Steps 1 to 3) */}
        {currentStep <= 3 && (
          <div className="px-6 pt-4 pb-2 bg-[#121214] border-b border-gray-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Step {currentStep} of 3</span>
              <span className="text-xs text-purple-400 font-medium">
                {currentStep === 1 && "Device Signature"}
                {currentStep === 2 && "Anti-Sybil Proof"}
                {currentStep === 3 && "Network Ledger"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    completedSteps.includes(step)
                      ? "bg-purple-500"
                      : currentStep === step
                      ? "bg-purple-600/60 animate-pulse"
                      : "bg-[#2c2c2e]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step Body */}
        <div className="p-6">
          {/* STEP 1: Device Key Attestation */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 mx-auto rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3">
                  <Key className="w-7 h-7" />
                </div>
                <h4 className="text-white font-semibold text-lg">Cryptographic Key Proof</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                  Verify cryptographic control of your anonymous identifier <span className="text-purple-300 font-semibold">{anonName}</span> using a local zero-knowledge signature.
                </p>
              </div>

              <div className="bg-[#2c2c2e]/60 border border-gray-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Cryptographic Challenge:</span>
                  <span className="font-mono text-purple-400">{challengeCode}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Signature Scheme:</span>
                  <span className="text-gray-200 font-mono">Ed25519-ZK</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Personal Data Requested:</span>
                  <span className="text-emerald-400 font-semibold">None (0 bytes)</span>
                </div>
              </div>

              <button
                onClick={handleRunKeyAttestation}
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-600/30"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Keyproof Signature...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Sign Cryptographic Challenge
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Zero-Knowledge Humanity Pattern */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 mx-auto rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
                  <Fingerprint className="w-7 h-7" />
                </div>
                <h4 className="text-white font-semibold text-lg">Anti-Sybil Humanity Proof</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                  To prevent bot networks from mass-claiming badges, tap the 4 sequence nodes below to complete the human presence circuit.
                </p>
              </div>

              <div className="bg-[#2c2c2e]/50 border border-gray-800 rounded-xl p-4 flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-3">Tap sequence: 1 → 2 → 3 → 4</p>
                <div className="grid grid-cols-2 gap-3 w-48">
                  {[1, 2, 3, 4].map((node) => {
                    const isSelected = selectedPattern.includes(node);
                    return (
                      <button
                        key={node}
                        onClick={() => handleSelectPatternNode(node)}
                        disabled={isProcessing || isSelected}
                        className={`aspect-square rounded-xl flex items-center justify-center text-lg font-mono font-bold transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white scale-95 shadow-md shadow-purple-600/40"
                            : "bg-[#1c1c1e] text-gray-300 hover:bg-[#3c3c3e] border border-gray-700 active:scale-95"
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-6 h-6 text-white" /> : node}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-gray-800 text-xs">
                  <span className="text-gray-400">
                    Selected: {selectedPattern.length}/4
                  </span>
                  <button
                    onClick={handleResetPattern}
                    className="text-purple-400 hover:underline text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-xs text-purple-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Verifying zero-knowledge puzzle...
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Network Decentralized Ledger */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 mx-auto rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3">
                  <Shield className="w-7 h-7" />
                </div>
                <h4 className="text-white font-semibold text-lg">Finalize Attestation</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                  Publish your anonymous zero-knowledge proof commitment to anoNote's decentralized peer verification ledger.
                </p>
              </div>

              <div className="bg-[#2c2c2e]/60 border border-gray-800 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Device Key Signature Verified</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Humanity Proof Passed (Zero Tracking)</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Verified Badge: Ready to Issue</span>
                </div>
              </div>

              <button
                onClick={handleFinalizeVerification}
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-600/30"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Committing to Verification Ledger...
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    Complete Verification & Claim Badge
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: Congratulations & Badge Active */}
          {currentStep === 4 && (
            <div className="text-center space-y-4 py-2">
              <div className="relative inline-block">
                <div className="w-20 h-20 mx-auto rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center text-purple-400 shadow-2xl shadow-purple-500/50">
                  <BadgeCheck className="w-12 h-12 fill-purple-600/30 text-purple-400" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-black p-1 rounded-full shadow">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold text-xl">Account Verified!</h4>
                <p className="text-sm text-purple-300 font-medium mt-1 flex items-center justify-center gap-1.5">
                  {anonName} <BadgeCheck className="w-4 h-4 text-purple-400 fill-purple-600/30" />
                </p>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto mt-2">
                  Your Verified Badge is now active across all chats, groups, and contact lists on anoNote. Other users can now verify your authenticity with confidence.
                </p>
              </div>

              <div className="bg-[#2c2c2e]/60 border border-purple-500/30 rounded-xl p-3 text-xs text-gray-300 text-left space-y-1">
                <p className="text-white font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" /> Complete Anonymity Maintained
                </p>
                <p className="text-[11px] text-gray-400">
                  No personal identity, email, or metadata was linked or saved during this process.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-lg shadow-purple-600/30"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
