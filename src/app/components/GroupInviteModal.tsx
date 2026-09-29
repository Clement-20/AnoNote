import { useState } from "react";
import { X, Link2, Copy, Check, RefreshCw, Share2 } from "lucide-react";

interface GroupInviteModalProps {
  groupName: string;
  groupId: string;
  onClose: () => void;
}

export function GroupInviteModal({ groupName, groupId, onClose }: GroupInviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState(() => `${window.location.origin}/group/${groupId}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetLink = () => {
    setInviteCode(`${window.location.origin}/group/${groupId}?t=${Date.now()}`);
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#111b21] border border-[#202c33] rounded-lg w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-[#202c33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link2 className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-[#e9edef] font-medium text-base">Invite via link</h3>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-[#e9edef] font-medium text-sm">{groupName}</h4>
            <p className="text-xs text-[#8696a0] mt-0.5">Anyone with AnoNote can use this link to join this group.</p>
          </div>

          <div className="bg-[#202c33] border border-[#2a3942] rounded-md p-3 flex items-center gap-3">
            <span className="text-xs text-[#e9edef] font-mono flex-1 truncate select-all">{inviteCode}</span>
            <button
              onClick={handleCopy}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleCopy}
              className="w-full bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-[#2a3942]"
            >
              <Share2 className="w-4 h-4 text-[#38bdf8]" />
              Share Link
            </button>
            <button
              onClick={handleResetLink}
              className="w-full text-[#f15c6d] hover:bg-[#f15c6d]/10 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Link
            </button>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#0b141a] border-t border-[#202c33] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded-md text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
