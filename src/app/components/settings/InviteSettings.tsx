import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { Copy, Share2, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { shareContent } from "../../utils/shareUtil";

export function InviteSettings() {
  const { currentUser, getConnectUrl } = useAuth();
  const [copied, setCopied] = useState(false);

  const inviteLink = getConnectUrl(currentUser.anonId);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await shareContent({
      title: "Connect with me on AnoNote",
      text: "Connect with me on AnoNote, the zero-knowledge end-to-end encrypted messenger.",
      url: inviteLink,
      onSuccess: (fallbackUsed) => {
        if (fallbackUsed) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      },
    });
  };

  return (
    <SettingsPage title="Invite a friend">
      <div className="p-4 space-y-4">
        <div className="bg-[#111b21] p-6 rounded-lg border border-[#202c33] text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-[#202c33] flex items-center justify-center text-4xl mx-auto border border-[#2a3942]">
            {currentUser.avatar}
          </div>
          <h3 className="text-base font-semibold text-[#e9edef]">{currentUser.name}</h3>
          <p className="text-xs font-mono text-[#38bdf8]">{currentUser.anonId}</p>
          <p className="text-xs text-[#8696a0] leading-relaxed max-w-sm mx-auto">
            Share your direct link to start an encrypted, zero-knowledge conversation with no account signup required.
          </p>
        </div>

        {/* Link Box */}
        <div className="bg-[#111b21] p-4 rounded-lg border border-[#202c33] space-y-3">
          <p className="text-xs font-medium text-[#8696a0]">Your Direct AnoNote Link</p>
          <div className="flex items-center gap-2 bg-[#202c33] px-3.5 py-2.5 rounded-md border border-[#2a3942]">
            <span className="text-xs text-[#e9edef] font-mono truncate flex-1 select-all">
              {inviteLink}
            </span>
            <button
              onClick={handleCopy}
              className="text-[#38bdf8] hover:text-[#0084ff] p-1 flex-shrink-0"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-[#38bdf8]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleCopy}
              className="py-2 px-3 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-[#2a3942]"
            >
              {copied ? <Check className="w-4 h-4 text-[#38bdf8]" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={handleShare}
              className="py-2 px-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
