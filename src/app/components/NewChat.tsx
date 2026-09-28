import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, UserPlus, Sparkles, Copy, Check } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";
import { subscribeToActiveUsers, getOrCreateDirectChat } from "../services/chatService";

export function NewChat() {
  const navigate = useNavigate();
  const { currentUser, getConnectUrl } = useAuth();
  const [search, setSearch] = useState("");
  const [customAnonId, setCustomAnonId] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToActiveUsers(currentUser.anonId, (users) => {
      setActiveUsers(users);
    });
    return () => unsub();
  }, [currentUser.anonId]);

  const filteredUsers = activeUsers.filter((u: any) =>
    u.anonId?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = () => {
    const url = getConnectUrl(currentUser.anonId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartChatWithAnon = async (targetId?: string) => {
    const raw = (targetId || customAnonId).trim();
    if (!raw) return;

    let formattedName = raw;
    if (raw.includes("connect=")) {
      try {
        const u = new URL(raw);
        formattedName = u.searchParams.get("connect") || raw;
      } catch (e) {
        // ignore
      }
    }

    if (formattedName.startsWith("Ghost")) {
      formattedName = formattedName.replace("Ghost", "Anon");
    }

    if (!formattedName.startsWith("Anon")) {
      const digits = formattedName.replace(/[^0-9a-zA-Z]/g, "");
      formattedName = `Anon #${digits || formattedName}`;
    }

    const chatId = await getOrCreateDirectChat(currentUser, formattedName);
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white p-1 -ml-1 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-lg">New Direct Chat</h1>
            <p className="text-xs text-purple-400">
              {activeUsers.length} Active {activeUsers.length === 1 ? "Peer" : "Peers"} on Cloud Network
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center bg-[#2c2c2e] rounded-xl px-3 py-2 border border-gray-700/50">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search active peers or enter Anon ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Connect With Any Anon ID */}
        <div className="p-4 border-b border-gray-800 bg-[#141416]">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
            Start Chat with any Anon ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Anon #4819 or paste invite link"
              value={customAnonId}
              onChange={(e) => setCustomAnonId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartChatWithAnon()}
              className="flex-1 bg-[#2c2c2e] border border-purple-500/30 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors font-mono"
            />
            <button
              onClick={() => handleStartChatWithAnon()}
              disabled={!customAnonId.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
            >
              <UserPlus className="w-4 h-4" />
              Chat
            </button>
          </div>
        </div>

        {/* Share your personal link */}
        <div className="p-4 border-b border-gray-800 bg-[#1a1a1c]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Share Your Invite Link</p>
              <p className="text-xs text-gray-400 font-mono">{currentUser.anonId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Share
            </button>
          </div>
        </div>

        {/* Real Network Users List */}
        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Real Network Peers ({filteredUsers.length})
          </h2>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <p className="text-gray-400 text-sm">No other real peers found yet.</p>
              <p className="text-gray-600 text-xs max-w-xs mx-auto">
                Share your invite link with your friend on WhatsApp, Telegram, or SMS to connect and chat in real time!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u: any) => (
                <div
                  key={u.anonId}
                  onClick={() => handleStartChatWithAnon(u.anonId)}
                  className="flex items-center justify-between p-3 bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-gray-800 hover:border-purple-500/30 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2c2c2e] border border-purple-500/30 flex items-center justify-center text-xl">
                      {u.avatar || "👤"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">{u.anonId}</span>
                        {u.isVerified && <VerifiedBadge size="xs" userName={u.name || u.anonId} />}
                      </div>
                      <p className="text-xs text-gray-400">{u.about || "Active anonymous peer"}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-medium hover:bg-purple-600 hover:text-white transition-colors">
                    Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
}
