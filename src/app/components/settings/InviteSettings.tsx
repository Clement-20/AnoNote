import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { Copy, Share2, QrCode, Check, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Connect with me on anoNote",
          text: `Chat with me securely and anonymously on anoNote: ${inviteLink}`,
          url: inviteLink,
        });
      } catch (e) {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <SettingsPage title="Invite a Friend">
      {/* Invite section */}
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-5xl mb-4 shadow-xl shadow-purple-600/30">
            {currentUser.avatar}
          </div>
          <h3 className="text-white text-xl font-semibold mb-1">
            Invite friends to anoNote
          </h3>
          <p className="text-xs text-purple-400 font-mono mb-2">anoNote.icepab.name.ng</p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            Share your direct connect link with friends. When they open it, an encrypted chat with you is created instantly with zero setup.
          </p>
        </div>

        {/* Share link card */}
        <div className="bg-[#1c1c1e] rounded-2xl border border-purple-500/30 overflow-hidden mb-5 shadow-xl">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h4 className="text-white font-medium text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Your Direct Connect Link
            </h4>
            <span className="text-[11px] text-purple-400 font-mono font-bold">{currentUser.anonId}</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 bg-[#2c2c2e] rounded-xl px-3.5 py-2.5">
              <span className="text-xs text-gray-300 flex-1 truncate font-mono select-all">
                {inviteLink}
              </span>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-purple-400 hover:text-purple-300 p-1 transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="py-2.5 px-4 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700 text-purple-300 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={handleShare}
                className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-600/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Link
              </button>
            </div>
          </div>
        </div>

        {/* Invite message */}
        <div className="bg-[#1c1c1e] rounded-xl border border-gray-800 p-4 mb-5">
          <h4 className="text-white font-medium text-xs mb-2">Pre-composed invite message</h4>
          <div className="bg-[#2c2c2e] rounded-lg p-3 text-xs text-gray-300 leading-relaxed font-mono">
            Hey! I'm on anoNote for secure anonymous messaging. Tap my direct link to connect with me instantly: {inviteLink}
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 w-full border border-purple-600/60 text-purple-400 hover:bg-purple-600/10 font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Full Message
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-purple-600/10 border border-purple-600/20 rounded-xl p-4">
          <h4 className="text-white font-medium text-xs mb-2">Why invite friends to anoNote?</h4>
          <ul className="space-y-1.5 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">✓</span>
              <span>Zero-knowledge end-to-end encrypted conversations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">✓</span>
              <span>Frictionless 1-tap connection with custom Anon IDs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">✓</span>
              <span>No phone numbers, emails, or personal tracking required</span>
            </li>
          </ul>
        </div>
      </div>
    </SettingsPage>
  );
}
