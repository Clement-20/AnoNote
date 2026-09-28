import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Camera, Edit2, ShieldCheck, BadgeCheck, Sparkles, Check, Copy, Share2, QrCode } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { VerificationModal } from "./VerificationModal";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";

export function Profile() {
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();

  const [about, setAbout] = useState(() => localStorage.getItem("ghost_note_account_about") || "Anonymous and secure on anoNote");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const avatarOptions = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️", "🚀", "⚡", "🔥", "💎", "🦁"];

  useEffect(() => {
    localStorage.setItem("ghost_note_account_about", about);
  }, [about]);

  const handleEditName = () => {
    const val = prompt("Enter your new display name:", currentUser.name);
    if (val && val.trim()) {
      updateProfile(val.trim());
    }
  };

  const handleEditAbout = () => {
    const val = prompt("Enter your about status:", about);
    if (val && val.trim()) {
      setAbout(val.trim());
    }
  };

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://anoNote.icepab.name.ng";
    const url = `${origin}/?connect=${encodeURIComponent(currentUser.anonId)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <h2 className="text-white font-medium text-lg">My Anon Profile</h2>
      </header>

      {/* Profile content */}
      <div className="flex-1 overflow-y-auto">
        {/* Avatar section */}
        <div className="bg-[#1c1c1e] flex flex-col items-center py-8 border-b border-gray-800">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-5xl shadow-xl shadow-purple-600/30">
              {currentUser.avatar}
            </div>
            {currentUser.isVerified && (
              <div className="absolute top-0 right-0 bg-[#1c1c1e] p-1.5 rounded-full border border-purple-500/40 shadow-lg">
                <VerifiedBadge size="md" userName={currentUser.name} />
              </div>
            )}
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2.5 transition-colors shadow-lg"
              title="Change Avatar Emoji"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {showAvatarPicker && (
            <div className="mt-4 p-3 bg-[#2c2c2e] border border-gray-700 rounded-2xl max-w-xs shadow-xl animate-in zoom-in-95">
              <p className="text-[11px] text-gray-400 font-semibold mb-2 text-center uppercase tracking-wider">
                Choose New Avatar Emoji
              </p>
              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      updateProfile(currentUser.name, emoji);
                      setShowAvatarPicker(false);
                    }}
                    className={`text-2xl p-2 rounded-xl hover:bg-purple-600/30 transition-all ${
                      currentUser.avatar === emoji ? "bg-purple-600 scale-110" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CONNECT LINK FAST TRACK */}
        <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Frictionless Peer Link
              </span>
              <p className="text-xs text-gray-400">Invite anyone directly to your encrypted channel</p>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Code
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-1.5 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-purple-500/30 rounded-xl text-xs text-purple-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied to Clipboard!" : "Copy My Connect Link"}
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="py-1.5 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700 rounded-xl text-xs text-gray-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verification Status Banner / Action Card */}
        <div className="p-4">
          {currentUser.isVerified ? (
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
                <p className="text-xs text-gray-400 mb-1">Display Name</p>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold">{currentUser.name}</p>
                  {currentUser.isVerified && <VerifiedBadge size="sm" userName={currentUser.name} />}
                </div>
              </div>
              <button onClick={handleEditName} className="text-purple-400 hover:text-purple-300 transition-colors p-1">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* About */}
          <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">About Status</p>
                <p className="text-white text-sm">{about}</p>
              </div>
              <button onClick={handleEditAbout} className="text-purple-400 hover:text-purple-300 transition-colors p-1">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800 mt-2">
            <div>
              <p className="text-xs text-gray-400 mb-1">Anon ID</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono font-bold text-base">{currentUser.anonId}</p>
                {currentUser.isVerified && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-medium">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this Anon ID with friends so they can find you on anoNote.icepab.name.ng
              </p>
            </div>
          </div>

          {/* Created */}
          <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800">
            <div>
              <p className="text-xs text-gray-400 mb-1">Account Created</p>
              <p className="text-white text-xs">
                {new Date(currentUser.createdAt || "2026-01-15").toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="px-4 py-6">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Your profile is only visible to people you chat with. anoNote
            keeps your identity anonymous and encrypted with zero-knowledge protocol.
          </p>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerifiedSuccess={() => {}}
      />

      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
}
