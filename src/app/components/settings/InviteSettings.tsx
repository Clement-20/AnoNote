import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { Copy, Share2, QrCode, Check } from "lucide-react";

export function InviteSettings() {
  const [copied, setCopied] = useState(false);
  const inviteLink = "https://anoNote.icepab.name.ng/invite/8462";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SettingsPage title="Invite a Friend">
      {/* Invite section */}
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-5xl mb-4 shadow-xl shadow-purple-600/30">
            🛡️
          </div>
          <h3 className="text-white text-xl font-semibold mb-1">
            Invite friends to anoNote
          </h3>
          <p className="text-xs text-purple-400 font-mono mb-2">anoNote.icepab.name.ng</p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            Share anoNote with your friends and enjoy zero-knowledge encrypted messaging
            together.
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="aspect-square max-w-xs mx-auto bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
            <QrCode className="w-32 h-32 text-purple-600" />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 font-medium">
            Scan this code to join anoNote on anoNote.icepab.name.ng
          </p>
        </div>

        {/* Share link */}
        <div className="bg-[#1c1c1e] rounded-xl border border-gray-800 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-800">
            <h4 className="text-white font-medium">Your invite link</h4>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 bg-[#2c2c2e] rounded-lg px-4 py-3 mb-3">
              <span className="text-sm text-gray-300 flex-1 truncate font-mono">
                {inviteLink}
              </span>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-purple-400 hover:text-purple-300 transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              {copied ? "Link Copied!" : "Share Link"}
            </button>
          </div>
        </div>

        {/* Invite message */}
        <div className="bg-[#1c1c1e] rounded-xl border border-gray-800 p-4">
          <h4 className="text-white font-medium mb-3">Share this message</h4>
          <div className="bg-[#2c2c2e] rounded-lg p-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              Hey! I'm using anoNote for encrypted anonymous messaging. Join me on anoNote at {inviteLink}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 w-full border border-purple-600 text-purple-400 hover:bg-purple-600/10 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Message
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-4 pb-6">
        <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Why invite friends to anoNote?</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✓</span>
              <span className="text-sm text-gray-400">
                Enjoy end-to-end encrypted anonymous conversations
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✓</span>
              <span className="text-sm text-gray-400">
                Connect without revealing personal phone numbers or emails
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✓</span>
              <span className="text-sm text-gray-400">
                Zero telemetry, zero tracking, and zero advertising
              </span>
            </li>
          </ul>
        </div>
      </div>
    </SettingsPage>
  );
}
