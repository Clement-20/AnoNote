import { useState } from "react";
import { useNavigate } from "react-router";
import {
  X,
  Copy,
  Check,
  Share2,
  QrCode,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getOrCreateDirectChat } from "../services/chatService";

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Connect with me on anoNote",
          text: `Chat with me securely on anoNote using my Anon ID: ${currentUser.anonId}`,
          url: connectUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
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
      setError("Could not connect to peer. Please check ID.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#181822] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#15151c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base font-display">Instant Connect</h3>
              <p className="text-[11px] text-gray-400">Share your invite link or connect with peers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: YOUR DIRECT CONNECT LINK */}
          <div className="bg-gradient-to-br from-purple-950/40 via-[#20182c]/60 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentUser.avatar}</span>
                <div>
                  <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                    Your Anon Connect Link
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{currentUser.anonId}</div>
                </div>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/10"
              >
                <QrCode className="w-3.5 h-3.5" />
                {showQR ? "Hide QR" : "Show QR"}
              </button>
            </div>

            {/* QR Code Preview */}
            {showQR && (
              <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-150 shadow-xl">
                <svg className="w-40 h-40" viewBox="0 0 100 100" fill="black">
                  <rect x="5" y="5" width="25" height="25" fill="#000" rx="4" />
                  <rect x="9" y="9" width="17" height="17" fill="#fff" rx="2" />
                  <rect x="13" y="13" width="9" height="9" fill="#7c3aed" rx="1.5" />

                  <rect x="70" y="5" width="25" height="25" fill="#000" rx="4" />
                  <rect x="74" y="9" width="17" height="17" fill="#fff" rx="2" />
                  <rect x="78" y="13" width="9" height="9" fill="#7c3aed" rx="1.5" />

                  <rect x="5" y="70" width="25" height="25" fill="#000" rx="4" />
                  <rect x="9" y="74" width="17" height="17" fill="#fff" rx="2" />
                  <rect x="13" y="78" width="9" height="9" fill="#7c3aed" rx="1.5" />

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
                  <rect x="40" y="65" width="5" height="5" />
                  <rect x="55" y="65" width="5" height="5" />
                  <rect x="70" y="65" width="5" height="5" />
                  <rect x="85" y="65" width="5" height="5" />
                  <rect x="40" y="75" width="5" height="5" />
                  <rect x="50" y="75" width="5" height="5" />
                  <rect x="65" y="75" width="5" height="5" />
                  <rect x="80" y="75" width="5" height="5" />
                  <rect x="35" y="85" width="5" height="5" />
                  <rect x="50" y="85" width="5" height="5" />
                  <rect x="60" y="85" width="5" height="5" />
                  <rect x="75" y="85" width="5" height="5" />
                  <rect x="85" y="85" width="5" height="5" />
                </svg>
                <span className="text-[11px] text-gray-700 font-mono font-bold mt-2">
                  Scan to chat directly with {currentUser.anonId}
                </span>
              </div>
            )}

            {/* Link display & copy */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={connectUrl}
                className="flex-1 bg-[#131318] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-gray-200 font-mono select-all outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 shadow-md shadow-purple-600/30 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 bg-white/[0.08] hover:bg-white/[0.14] text-gray-200 rounded-2xl transition-all flex-shrink-0 border border-white/10"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-purple-300/80">
              When friends open this link, they are instantly connected with you in an encrypted channel!
            </p>
          </div>

          {/* SECTION 2: CONNECT WITH A FRIEND */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Connect With Any Friend or Peer
            </h4>

            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste friend's link or Anon ID (e.g. 7291 or Anon #7291)"
                  value={peerInput}
                  onChange={(e) => {
                    setPeerInput(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleConnectWithPeer()}
                  className="w-full bg-[#1e1e28] border border-white/10 focus:border-purple-500/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                />
              </div>
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>

            <button
              onClick={() => handleConnectWithPeer()}
              disabled={!peerInput.trim() || isConnecting}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95"
            >
              <span>{isConnecting ? "Connecting..." : "Start Encrypted Chat"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Peers */}
            <div className="pt-2">
              <p className="text-[11px] text-gray-500 mb-2">Or test instant connect with network peers:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Anon #3847", avatar: "👤" },
                  { name: "Anon #7291", avatar: "🕶️" },
                  { name: "Anon #5612", avatar: "🎭" },
                  { name: "Anon #9204", avatar: "🔮" },
                ].map((peer) => (
                  <button
                    key={peer.name}
                    onClick={() => handleConnectWithPeer(peer.name)}
                    className="px-3 py-1.5 bg-white/[0.06] hover:bg-purple-600/20 hover:border-purple-500/40 border border-white/[0.08] rounded-xl text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>{peer.avatar}</span>
                    <span className="font-mono text-[11px] font-semibold">{peer.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
