import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Search,
  MoreVertical,
  ShieldCheck,
  Plus,
  Archive,
  BadgeCheck,
  Radio,
  X,
  UserPlus,
  Share2,
  Copy,
  Check,
  Sparkles,
  LogOut,
  Users,
} from "lucide-react";
import { ChatListItem } from "./ChatListItem";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";

const initialChats = [
  {
    id: "1",
    name: "Anon #3847",
    lastMessage: "That sounds interesting! Tell me more...",
    timestamp: "2:45 PM",
    unread: 2,
    avatar: "👤",
    isVerified: true,
  },
  {
    id: "2",
    name: "Anon #7291",
    lastMessage: "Thanks for sharing that",
    timestamp: "1:32 PM",
    unread: 0,
    avatar: "🕶️",
    isVerified: true,
  },
  {
    id: "3",
    name: "Anon #5612",
    lastMessage: "See you later!",
    timestamp: "Yesterday",
    unread: 0,
    avatar: "🎭",
    isVerified: false,
  },
  {
    id: "4",
    name: "Anon #9204",
    lastMessage: "Can we talk about the project?",
    timestamp: "Yesterday",
    unread: 0,
    avatar: "👤",
    isVerified: false,
  },
  {
    id: "5",
    name: "Anon #4156",
    lastMessage: "I'll send the files soon",
    timestamp: "Wednesday",
    unread: 0,
    avatar: "🌑",
    isVerified: false,
  },
  {
    id: "6",
    name: "Anon #8873",
    lastMessage: "Have a great day!",
    timestamp: "Tuesday",
    unread: 0,
    avatar: "💭",
    isVerified: false,
  },
  {
    id: "7",
    name: "Anon #2490",
    lastMessage: "Call me when you're free",
    timestamp: "Monday",
    unread: 0,
    avatar: "🔮",
    isVerified: true,
  },
];

export function ChatList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, savedAccounts, switchAccount, getConnectUrl } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [connectPeerParam, setConnectPeerParam] = useState<string | undefined>();
  const [copiedLink, setCopiedLink] = useState(false);

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("anonote_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          isVerified: c.isVerified ?? (["1", "2", "7"].includes(c.id)),
        }));
      } catch (e) {
        return initialChats;
      }
    }
    return initialChats;
  });

  const [broadcast, setBroadcast] = useState(() => {
    return localStorage.getItem("anonote_admin_broadcast") || "";
  });

  // Frictionless Direct Connect: If URL has ?connect=PeerID, automatically initiate chat!
  useEffect(() => {
    const peer = searchParams.get("connect");
    if (peer) {
      let peerName = decodeURIComponent(peer).trim();
      if (!peerName.startsWith("Anon")) {
        const digits = peerName.replace(/[^0-9a-zA-Z]/g, "");
        peerName = `Anon #${digits || peerName}`;
      }

      // Check if chat already exists
      const existing = chats.find((c: any) => c.name.toLowerCase() === peerName.toLowerCase());
      if (existing) {
        navigate(`/chat/${existing.id}`);
      } else {
        const newId = `peer_${Date.now()}`;
        const newChat = {
          id: newId,
          name: peerName,
          lastMessage: "Encrypted conversation initiated via direct connect",
          timestamp: "Just now",
          unread: 0,
          avatar: "👤",
        };
        const updated = [newChat, ...chats];
        setChats(updated);
        localStorage.setItem("anonote_chats", JSON.stringify(updated));
        navigate(`/chat/${newId}`);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem("anonote_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    const handleBroadcastUpdate = (e: any) => {
      setBroadcast(e.detail?.message ?? (localStorage.getItem("anonote_admin_broadcast") || ""));
    };
    window.addEventListener("system_broadcast_updated", handleBroadcastUpdate);
    return () => window.removeEventListener("system_broadcast_updated", handleBroadcastUpdate);
  }, []);

  const handleCopyMyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getConnectUrl(currentUser.anonId);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredChats = chats.filter(
    (chat: any) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#111111] relative">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg text-white font-bold tracking-tight leading-tight">anoNote</h1>
            <span className="text-[10px] text-purple-400 font-mono block -mt-0.5">anoNote.icepab.name.ng</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Connect / Share Link Button */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-medium transition-colors"
            title="Connect with friends via direct link or QR"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Connect</span>
          </button>

          {/* User Account / Identity Switcher Pill */}
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700/60 rounded-xl text-xs text-white transition-colors"
            title="Manage or Switch Identity"
          >
            <span className="text-sm">{currentUser.avatar}</span>
            <span className="font-mono text-[11px] font-semibold text-gray-200 hidden xs:inline">
              {currentUser.anonId.replace("Anon #", "#")}
            </span>
          </button>

          <Link to="/new-chat" className="text-gray-400 hover:text-white p-1.5 transition-colors" title="New Chat">
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Account / Identity Quick-Switch Dropdown */}
      {showAccountMenu && (
        <div className="absolute top-14 right-4 z-40 bg-[#1c1c1e] border border-purple-500/40 rounded-2xl w-64 p-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">{currentUser.avatar}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-purple-400 font-mono">Active Identity</div>
              </div>
            </div>
            <button
              onClick={handleCopyMyLink}
              className="p-1.5 text-gray-400 hover:text-white bg-[#2c2c2e] rounded-lg transition-colors"
              title="Copy your connect link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Switch Saved Identity
          </p>

          <div className="space-y-1 mb-2 max-h-36 overflow-y-auto">
            {savedAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  switchAccount(acc.id);
                  setShowAccountMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  acc.id === currentUser.id
                    ? "bg-purple-600/30 text-purple-300 font-semibold border border-purple-500/30"
                    : "hover:bg-[#2c2c2e] text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span>{acc.avatar}</span>
                  <span className="truncate">{acc.name}</span>
                </div>
                {acc.id === currentUser.id && <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-800 space-y-1">
            <Link
              to="/signup"
              onClick={() => setShowAccountMenu(false)}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Anon Identity</span>
            </Link>
            <Link
              to="/login"
              onClick={() => setShowAccountMenu(false)}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Log In with Another ID</span>
            </Link>
          </div>
        </div>
      )}

      {/* System Broadcast Announcement */}
      {broadcast && (
        <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-purple-500/40 px-4 py-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-purple-200 min-w-0 text-xs">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
            <span className="truncate font-medium">{broadcast}</span>
          </div>
          <button
            onClick={() => setBroadcast("")}
            className="text-gray-400 hover:text-white p-1 ml-2 rounded-md transition-colors"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FRICTIONLESS QUICK CONNECT BANNER */}
      <div className="bg-gradient-to-r from-[#1c1c1e] to-[#252528] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="text-xs text-gray-300 truncate">
            Your ID: <strong className="text-white font-mono">{currentUser.anonId}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopyMyLink}
            className="px-2.5 py-1 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            {copiedLink ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span>Connect</span>
          </button>
        </div>
      </div>

      {/* Archived Section Link */}
      <Link to="/archived" className="flex items-center gap-3 px-4 py-3 bg-[#1c1c1e] hover:bg-[#2c2c2e] border-b border-gray-800 transition-colors">
        <Archive className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm">Archived chats</h3>
          <p className="text-xs text-gray-400 truncate">1 inactive conversation</p>
        </div>
      </Link>

      {/* Search bar */}
      <div className="px-4 py-3 bg-[#1c1c1e] border-b border-gray-800">
        <div className="flex items-center bg-[#2c2c2e] rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search conversations by name or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 space-y-3">
            <p className="text-gray-400 text-sm">No chats found matching "{searchQuery}"</p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Connect with a Friend Now
            </button>
          </div>
        ) : (
          filteredChats.map((chat: any) => (
            <Link key={chat.id} to={`/chat/${chat.id}`} className="block">
              <ChatListItem {...chat} />
            </Link>
          ))
        )}
      </div>

      {/* Connect Modal */}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        initialPeerId={connectPeerParam}
      />
    </div>
  );
}
