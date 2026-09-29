import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Camera, Pencil, QrCode, Copy, Check } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { VerificationModal } from "./VerificationModal";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";

export function Profile() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, getConnectUrl } = useAuth();

  const [about, setAbout] = useState(() => localStorage.getItem("ghost_note_account_about") || "Available on anoNote");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const avatarOptions = ["🎭", "🕶️", "👤", "🌑", "💭", "🔮", "🎪", "🌙", "✨", "🛡️", "🚀", "⚡", "🔥", "💎", "🦁"];

  useEffect(() => {
    localStorage.setItem("ghost_note_account_about", about);
  }, [about]);

  const handleEditName = () => {
    const val = prompt("Enter your name:", currentUser.name);
    if (val && val.trim()) {
      updateProfile(val.trim());
    }
  };

  const handleEditAbout = () => {
    const val = prompt("Enter your About:", about);
    if (val && val.trim()) {
      setAbout(val.trim());
    }
  };

  const handleCopyLink = () => {
    const url = getConnectUrl(currentUser.anonId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] select-none">
      {/* Header */}
      <header className="bg-[#111b21] px-4 py-3 border-b border-[#202c33] flex items-center gap-4">
        <button
          onClick={() => navigate("/settings")}
          className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-semibold text-[#e9edef]">Profile</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Large Avatar Section */}
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            <div className="w-36 h-36 rounded-full bg-[#202c33] flex items-center justify-center text-6xl overflow-hidden border-2 border-[#202c33]">
              {currentUser.avatar || "👤"}
            </div>
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute bottom-1 right-1 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-full p-3 shadow-lg transition-transform active:scale-95"
              title="Change Photo"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {showAvatarPicker && (
            <div className="mt-4 p-3 bg-[#202c33] border border-[#2a3942] rounded-2xl max-w-xs shadow-xl">
              <p className="text-xs text-[#8696a0] mb-2 text-center uppercase tracking-wider font-semibold">
                Choose Avatar Emoji
              </p>
              <div className="grid grid-cols-5 gap-2">
                {avatarOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      updateProfile(currentUser.name, emoji);
                      setShowAvatarPicker(false);
                    }}
                    className={`text-2xl p-2 rounded-xl hover:bg-[#111b21] transition-colors ${
                      currentUser.avatar === emoji ? "bg-[#0084ff] text-white" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Field: Name */}
        <div
          onClick={handleEditName}
          className="px-6 py-3 hover:bg-[#202c33]/40 border-b border-[#202c33]/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8696a0] mb-0.5">Name</p>
              <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-medium text-[#e9edef]">{currentUser.name}</p>
                {currentUser.isVerified && <VerifiedBadge size="xs" userName={currentUser.name} />}
              </div>
              <p className="text-xs text-[#8696a0] mt-1">
                This is not your username or pin. This name will be visible to your contacts.
              </p>
            </div>
            <Pencil className="w-4 h-4 text-[#0084ff] flex-shrink-0 ml-3" />
          </div>
        </div>

        {/* Profile Field: About */}
        <div
          onClick={handleEditAbout}
          className="px-6 py-3 hover:bg-[#202c33]/40 border-b border-[#202c33]/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8696a0] mb-0.5">About</p>
              <p className="text-[15px] text-[#e9edef]">{about}</p>
            </div>
            <Pencil className="w-4 h-4 text-[#0084ff] flex-shrink-0 ml-3" />
          </div>
        </div>

        {/* Profile Field: Anon ID */}
        <div className="px-6 py-3 border-b border-[#202c33]/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8696a0] mb-0.5">Anon ID (Phone Key)</p>
              <p className="text-[15px] font-mono text-[#e9edef]">{currentUser.anonId}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="text-[#0084ff] p-1.5 hover:bg-[#202c33] rounded-full"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-[#38bdf8]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* QR Code Action */}
        <div className="p-6">
          <button
            onClick={() => setShowConnectModal(true)}
            className="w-full py-3 px-4 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-[#0084ff]" />
            <span>Show my QR Code & Invite Link</span>
          </button>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerifiedSuccess={() => {}}
      />

      <ConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </div>
  );
}
