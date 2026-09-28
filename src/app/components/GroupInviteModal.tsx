import { useState } from "react";
import { X, Link2, Copy, Check, RefreshCw, Share2 } from "lucide-react";

interface GroupInviteModalProps {
  groupName: string;
  groupId: string;
  onClose: () => void;
}

export function GroupInviteModal({ groupName, groupId, onClose }: GroupInviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState(`https://anoNote.icepab.name.ng/join/${groupId}_${Math.random().toString(36).substring(2, 8)}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetLink = () => {
    setInviteCode(`https://anoNote.icepab.name.ng/join/${groupId}_${Math.random().toString(36).substring(2, 8)}`);
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold text-lg">Invite via Link</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <h4 className="text-white font-medium text-base mb-1">{groupName}</h4>
            <p className="text-xs text-gray-400">Anyone with anoNote can use this link to join this group.</p>
          </div>

          <div className="bg-[#2c2c2e] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <span className="text-sm text-purple-300 font-mono flex-1 truncate">{inviteCode}</span>
            <button
              onClick={handleCopy}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="w-full bg-[#2c2c2e] hover:bg-[#3c3c3e] text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              Share Link to Clipboard
            </button>
            <button
              onClick={handleResetLink}
              className="w-full bg-transparent hover:bg-red-500/10 text-red-400 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Revoke & Reset Invite Link
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#111111] border-t border-gray-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-white rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
