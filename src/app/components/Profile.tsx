import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Camera, Edit2, ShieldCheck, BadgeCheck, Sparkles, Check } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { VerificationModal } from "./VerificationModal";

export function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem("ghost_note_account_name") || "Anon #8462");
  const [about, setAbout] = useState(() => localStorage.getItem("ghost_note_account_about") || "Anonymous and secure on anoNote");
  const [isVerified, setIsVerified] = useState(() => localStorage.getItem("anon_is_verified") === "true");
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("ghost_note_account_name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("ghost_note_account_about", about);
  }, [about]);

  useEffect(() => {
    const handleVerificationUpdate = (e: any) => {
      setIsVerified(e.detail?.verified ?? (localStorage.getItem("anon_is_verified") === "true"));
    };
    window.addEventListener("verification_updated", handleVerificationUpdate);
    return () => window.removeEventListener("verification_updated", handleVerificationUpdate);
  }, []);

  const handleEditName = () => {
    const val = prompt("Enter your new display name:", name);
    if (val && val.trim()) {
      setName(val.trim());
    }
  };

  const handleEditAbout = () => {
    const val = prompt("Enter your about status:", about);
    if (val && val.trim()) {
      setAbout(val.trim());
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={() => navigate("/settings")}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium text-lg">Profile</h2>
      </header>

      {/* Profile content */}
      <div className="flex-1 overflow-y-auto">
        {/* Avatar section */}
        <div className="bg-[#1c1c1e] flex flex-col items-center py-8 border-b border-gray-800">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-6xl shadow-xl shadow-purple-600/30">
              🎭
            </div>
            {isVerified && (
              <div className="absolute top-0 right-0 bg-[#1c1c1e] p-1.5 rounded-full border border-purple-500/40 shadow-lg">
                <VerifiedBadge size="md" userName={name} />
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verification Status Banner / Action Card */}
        <div className="p-4">
          {isVerified ? (
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <BadgeCheck className="w-6 h-6 fill-purple-600/30 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm flex items-center gap-1.5">
                    Verified Anonymous Identity
                  </h4>
                  <p className="text-xs text-purple-300/80">
                    Zero-knowledge cryptographic attestation active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerificationModal(true)}
                className="px-3 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-purple-300 rounded-lg text-xs font-medium transition-colors"
              >
                View Proof
              </button>
            </div>
          ) : (
            <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    Get Verified Badge
                  </h4>
                  <p className="text-xs text-gray-400">
                    Complete multi-step proof to build trust
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerificationModal(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Verify Now
              </button>
            </div>
          )}
        </div>

        {/* Profile fields */}
        <div>
          {/* Name */}
          <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Name</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{name}</p>
                  {isVerified && <VerifiedBadge size="sm" userName={name} />}
                </div>
              </div>
              <button onClick={handleEditName} className="text-purple-400 hover:text-purple-300 transition-colors p-1">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* About */}
          <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">About</p>
                <p className="text-white">{about}</p>
              </div>
              <button onClick={handleEditAbout} className="text-purple-400 hover:text-purple-300 transition-colors p-1">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800 mt-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Anon Identity</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono font-semibold">#8462</p>
                {isVerified && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-medium">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your unique anonymous identifier on anoNote.icepab.name.ng
              </p>
            </div>
          </div>

          {/* Created */}
          <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800">
            <div>
              <p className="text-sm text-gray-400 mb-1">Created</p>
              <p className="text-white">January 15, 2026</p>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="px-4 py-6">
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Your profile is only visible to people you chat with. anoNote
            keeps your identity anonymous and secure.
          </p>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerifiedSuccess={() => setIsVerified(true)}
      />
    </div>
  );
}
