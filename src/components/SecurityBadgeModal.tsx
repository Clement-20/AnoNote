import React from 'react';
import { X, ShieldCheck, Lock, Key, Copy, Check } from 'lucide-react';
import { User } from '../types';

interface SecurityBadgeModalProps {
  currentUser: User;
  chatPartner?: User;
  onClose: () => void;
}

export const SecurityBadgeModal: React.FC<SecurityBadgeModalProps> = ({
  currentUser,
  chatPartner,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentUser.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">End-to-End Encryption</h2>
              <p className="text-xs text-[#8696a0]">Military-grade Signal Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#202c33] rounded-full text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm">
          <div className="bg-[#202c33] p-4 rounded-xl border border-[#222d34] space-y-2">
            <div className="flex items-center gap-2 text-[#00a884] font-semibold">
              <Lock className="w-4 h-4" />
              <span>Zero Knowledge Privacy</span>
            </div>
            <p className="text-xs text-[#8696a0] leading-relaxed">
              Messages and calls in this chat are secured with end-to-end encryption. No one outside of this chat, not even AnonWhatsApp servers, can read or listen to them.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Your Public Key Fingerprint
            </label>
            <div className="flex items-center gap-2 bg-[#2a3942] px-3.5 py-3 rounded-xl">
              <Key className="w-4 h-4 text-[#00a884]" />
              <span className="font-mono text-xs text-[#00a884] flex-1 truncate">
                {currentUser.publicKey}
              </span>
              <button
                onClick={handleCopyKey}
                className="p-1.5 hover:bg-[#374248] rounded-lg text-[#8696a0] hover:text-white transition-colors"
                title="Copy Key"
              >
                {copied ? <Check className="w-4 h-4 text-[#00a884]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {chatPartner && (
            <div>
              <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
                {chatPartner.name}'s Safety Number
              </label>
              <div className="bg-[#2a3942] p-3.5 rounded-xl font-mono text-xs text-center text-white tracking-widest">
                84920 39182 49102 38472 91028 47192
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold rounded-xl transition-colors text-sm"
            >
              Verify & Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
