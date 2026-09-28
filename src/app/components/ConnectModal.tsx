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
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
      } catch (e) {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleConnectWithPeer = (customPeer?: string) => {
    const raw = (customPeer || peerInput).trim();
    if (!raw) {
      setError("Please enter a valid Anon ID or paste an invite link");
      return;
    }

    let peerName = raw;
    // If user pasted a URL
    if (raw.includes("connect=")) {
      try {
        const url = new URL(raw);
        peerName = url.searchParams.get("connect") || raw;
      } catch (e) {
        // use raw
      }
    }

    if (!peerName.startsWith("Anon")) {
      const digits = peerName.replace(/[^0-9a-zA-Z]/g, "");
      peerName = `Anon #${digits || peerName}`;
    }

    // Add peer to contacts & chats seamlessly
    const newId = `peer_${Date.now()}`;
    const newChat = {
      id: newId,
      name: peerName,
      lastMessage: "Encrypted direct channel initiated",
      timestamp: "Just now",
      unread: 0,
      avatar: "👤",
    };

    try {
      const existingChats = JSON.parse(localStorage.getItem("anonote_chats") || "[]");
      const filtered = existingChats.filter((c: any) => c.name !== peerName);
      localStorage.setItem("anonote_chats", JSON.stringify([newChat, ...filtered]));

      const existingContacts = JSON.parse(localStorage.getItem("anonote_contacts") || "[]");
      const filteredContacts = existingContacts.filter((c: any) => c.name !== peerName);
      localStorage.setItem("anonote_contacts", JSON.stringify([
        { id: newId, name: peerName, avatar: "👤", about: "Direct anonymous peer" },
        ...filteredContacts
      ]));
    } catch (e) {
      console.error(e);
    }

    onClose();
    navigate(`/chat/${newId}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1c1c1e] border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Frictionless Connect</h3>
              <p className="text-[11px] text-gray-400">Share your link or connect with peers in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: YOUR DIRECT CONNECT LINK */}
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentUser.avatar}</span>
                <div>
                  <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                    Your Anon Connect Link
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{currentUser.anonId}</div>
                </div>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-2.5 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-purple-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                {showQR ? "Hide QR" : "Show QR"}
              </button>
            </div>

            {/* QR Code Preview */}
            {showQR && (
              <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-150 shadow-inner">
                {/* Visual QR pattern */}
                <svg className="w-40 h-40" viewBox="0 0 100 100" fill="black">
                  {/* Position detection squares */}
                  <rect x="5" y="5" width="25" height="25" fill="#000" rx="3" />
                  <rect x="9" y="9" width="17" height="17" fill="#fff" rx="2" />
                  <rect x="13" y="13" width="9" height="9" fill="#7c3aed" rx="1" />

                  <rect x="70" y="5" width="25" height="25" fill="#000" rx="3" />
                  <rect x="74" y="9" width="17" height="17" fill="#fff" rx="2" />
                  <rect x="78" y="13" width="9" height="9" fill="#7c3aed" rx="1" />

                  <rect x="5" y="70" width="25" height="25" fill="#000" rx="3" />
                  <rect x="9" y="74" width="17" height="17" fill="#fff" rx="2" />
                  <rect x="13" y="78" width="9" height="9" fill="#7c3aed" rx="1" />

                  {/* QR Data modules pattern */}
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
                <span className="text-[11px] text-gray-700 font-mono font-semibold mt-2">
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
                className="flex-1 bg-[#141416] border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono select-all outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-md shadow-purple-600/30"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-gray-300 rounded-xl transition-colors flex-shrink-0"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-purple-300/80">
              When friends open this link, they are instantly connected with you in an encrypted chat!
            </p>
          </div>

          {/* SECTION 2: CONNECT WITH A FRIEND */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
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
                  onKeyPress={(e) => e.key === "Enter" && handleConnectWithPeer()}
                  className="w-full bg-[#2c2c2e] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>

            <button
              onClick={() => handleConnectWithPeer()}
              disabled={!peerInput.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-xs md:text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
            >
              Start Encrypted Chat
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Peers */}
            <div className="pt-2">
              <p className="text-[11px] text-gray-500 mb-2">Or test instant connect with active peers:</p>
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
                    className="px-2.5 py-1.5 bg-[#2c2c2e] hover:bg-purple-600/20 hover:border-purple-500/50 border border-gray-800 rounded-lg text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>{peer.avatar}</span>
                    <span className="font-mono text-[11px]">{peer.name}</span>
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
