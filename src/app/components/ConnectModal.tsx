import { useState } from "react";
import { useNavigate } from "react-router";
import { X, Copy, Check, Share2, QrCode, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getOrCreateDirectChat } from "../services/chatService";
import { shareContent } from "../utils/shareUtil";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPeerId?: string;
}

export function ConnectModal({ isOpen, onClose, initialPeerId }: ConnectModalProps) {
  const navigate = useNavigate();
  const { currentUser, getConnectUrl } = useAuth();
  const [peerInput, setPeerInput] = useState(initialPeerId || "");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const connectUrl = getConnectUrl(currentUser.anonId);

  const handleCopy = () => {
    navigator.clipboard.writeText(connectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    await shareContent({
      title: "Connect on AnoNote",
      text: `Chat with me securely on AnoNote: ${currentUser.anonId}`,
      url: connectUrl,
      onSuccess: (fallbackUsed) => {
        if (fallbackUsed) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      },
    });
  };

  const handleConnectWithPeer = async (customPeer?: string) => {
    const raw = (customPeer || peerInput).trim();
    if (!raw) {
      setError("Please enter a valid Anon ID or paste an invite link");
      return;
    }

    let peerName = raw;
    if (raw.includes("connect=")) {
      try {
        const url = new URL(raw);
        peerName = url.searchParams.get("connect") || raw;
      } catch {
        // use raw
      }
    }

    if (peerName.startsWith("Ghost")) {
      peerName = peerName.replace("Ghost", "Anon");
    }
    if (!peerName.startsWith("Anon")) {
      const digits = peerName.replace(/[^0-9a-zA-Z]/g, "");
      peerName = `Anon #${digits || peerName}`;
    }

    setIsConnecting(true);
    try {
      const chatId = await getOrCreateDirectChat(currentUser, peerName);
      onClose();
      navigate(`/chat/${chatId}`);
    } catch {
      setError("Could not connect to peer.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 select-none">
      <div className="bg-[#111b21] border border-[#202c33] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#202c33] flex items-center justify-between">
          <h3 className="text-[#e9edef] font-medium text-[16px]">Share Invite Link</h3>
          <button
            onClick={onClose}
            className="text-[#8696a0] hover:text-[#e9edef] p-1 rounded-full hover:bg-[#202c33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* User's Invite Link */}
          <div className="bg-[#202c33] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111b21] flex items-center justify-center text-xl">
                  {currentUser.avatar || "👤"}
                </div>
                <div>
                  <p className="text-xs text-[#8696a0]">Your Anon Link</p>
                  <p className="text-sm font-bold text-[#e9edef] font-mono">{currentUser.anonId}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-3 py-1.5 bg-[#111b21] text-[#38bdf8] rounded-lg text-xs font-medium hover:bg-[#182229] transition-colors"
              >
                <QrCode className="w-4 h-4 inline mr-1" />
                {showQR ? "Hide QR" : "Show QR"}
              </button>
            </div>

            {/* QR Code */}
            {showQR && (
              <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center">
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="black">
                  <rect x="5" y="5" width="25" height="25" fill="#000" rx="2" />
                  <rect x="9" y="9" width="17" height="17" fill="#fff" rx="1" />
                  <rect x="13" y="13" width="9" height="9" fill="#0084ff" />

                  <rect x="70" y="5" width="25" height="25" fill="#000" rx="2" />
                  <rect x="74" y="9" width="17" height="17" fill="#fff" rx="1" />
                  <rect x="78" y="13" width="9" height="9" fill="#0084ff" />

                  <rect x="5" y="70" width="25" height="25" fill="#000" rx="2" />
                  <rect x="9" y="74" width="17" height="17" fill="#fff" rx="1" />
                  <rect x="13" y="78" width="9" height="9" fill="#0084ff" />

                  <rect x="35" y="8" width="5" height="5" />
                  <rect x="45" y="8" width="5" height="5" />
                  <rect x="55" y="8" width="5" height="5" />
                  <rect x="35" y="18" width="5" height="5" />
                  <rect x="50" y="18" width="5" height="5" />
                  <rect x="40" y="28" width="5" height="5" />
                  <rect x="48" y="28" width="5" height="5" />
                  <rect x="58" y="28" width="5" height="5" />
                  <rect x="15" y="40" width="5" height="5" />
                  <rect x="25" y="40" width="5" height="5" />
                  <rect x="35" y="40" width="5" height="5" />
                  <rect x="45" y="40" width="5" height="5" />
                  <rect x="55" y="40" width="5" height="5" />
                  <rect x="65" y="40" width="5" height="5" />
                  <rect x="75" y="40" width="5" height="5" />
                  <rect x="85" y="40" width="5" height="5" />
                  <rect x="10" y="50" width="5" height="5" />
                  <rect x="20" y="50" width="5" height="5" />
                  <rect x="35" y="50" width="5" height="5" />
                  <rect x="50" y="50" width="5" height="5" />
                  <rect x="65" y="50" width="5" height="5" />
                  <rect x="80" y="50" width="5" height="5" />
                </svg>
                <span className="text-[11px] text-gray-800 font-mono mt-2 font-semibold">
                  Scan to chat on AnoNote
                </span>
              </div>
            )}

            {/* Link input & copy */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={connectUrl}
                className="flex-1 bg-[#111b21] border border-[#2a3942] rounded-lg px-3 py-2 text-xs text-[#e9edef] font-mono select-all outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-[#0084ff] hover:bg-[#0070df] text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-[#111b21] hover:bg-[#182229] text-[#e9edef] rounded-lg transition-colors border border-[#2a3942]"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Connect With Any Peer */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
              Start chat with friend's Anon ID
            </h4>

            <div>
              <input
                type="text"
                placeholder="e.g. Anon #7291 or paste invite link"
                value={peerInput}
                onChange={(e) => {
                  setPeerInput(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleConnectWithPeer()}
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-lg px-3.5 py-2.5 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none"
              />
              {error && <p className="text-xs text-[#f15c6d] mt-1.5">{error}</p>}
            </div>

            <button
              onClick={() => handleConnectWithPeer()}
              disabled={!peerInput.trim() || isConnecting}
              className="w-full bg-[#0084ff] hover:bg-[#0070df] disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{isConnecting ? "Connecting..." : "Open Chat"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
