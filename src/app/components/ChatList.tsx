import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router";
import {
  Search,
  ShieldCheck,
  Plus,
  Radio,
  X,
  UserPlus,
  Share2,
  Copy,
  Check,
  Sparkles,
  Users,
  MessageSquare,
  Globe,
  WifiOff,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { ChatListItem } from "./ChatListItem";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";
import {
  subscribeToUserChats,
  subscribeToActiveUsers,
  subscribeToAllUserDrafts,
  getOrCreateDirectChat,
  FirestoreChat,
} from "../services/chatService";

export function ChatList() {
  const navigate = useNavigate();
  const { id: currentOpenChatId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser, savedAccounts, switchAccount, getConnectUrl } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [connectPeerParam, setConnectPeerParam] = useState<string | undefined>();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"chats" | "discover">("chats");
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [draftsMap, setDraftsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Real-time Firestore chats
  const [firestoreChats, setFirestoreChats] = useState<FirestoreChat[]>([]);
  const [activeNetworkUsers, setActiveNetworkUsers] = useState<any[]>([]);

  // Subscribe to all drafts for the current user
  useEffect(() => {
    const unsubDrafts = subscribeToAllUserDrafts(currentUser.anonId, (drafts) => {
      setDraftsMap(drafts);
    });
    return () => unsubDrafts();
  }, [currentUser.anonId]);

  const [broadcast, setBroadcast] = useState(() => {
    return localStorage.getItem("anonote_admin_broadcast") || "";
  });

  // Subscribe to real-time chats for the current user in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToUserChats(currentUser.anonId, (chats) => {
      setFirestoreChats(chats);
      localStorage.setItem("anonote_chats_cache", JSON.stringify(chats));
    });

    return () => unsubscribe();
  }, [currentUser.anonId]);

  // Subscribe to active peers across the network
  useEffect(() => {
    const unsub = subscribeToActiveUsers(currentUser.anonId, (users) => {
      setActiveNetworkUsers(users);
    });
    return () => unsub();
  }, [currentUser.anonId]);

  // Direct Connect handler if URL param present
  useEffect(() => {
    const peer = searchParams.get("connect");
    if (peer) {
      let peerName = decodeURIComponent(peer).trim();
      if (peerName.startsWith("Ghost")) {
        peerName = peerName.replace("Ghost", "Anon");
      }
      if (!peerName.startsWith("Anon")) {
        const digits = peerName.replace(/[^0-9a-zA-Z]/g, "");
        peerName = `Anon #${digits || peerName}`;
      }

      setConnectPeerParam(peerName);
      getOrCreateDirectChat(currentUser, peerName).then((chatId) => {
        navigate(`/chat/${chatId}`, { replace: true });
      });
    }
  }, [searchParams, currentUser]);

  const handleCopyMyLink = async () => {
    const link = getConnectUrl();
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleStartPeerChat = async (peer: any) => {
    const chatId = await getOrCreateDirectChat(currentUser, peer.anonId, peer.avatar);
    navigate(`/chat/${chatId}`);
  };

  // Map firestore chats to item format
  const mappedChats = firestoreChats.map((c) => {
    let formattedTime = "Just now";
    if (c.updatedAt || c.createdAt) {
      try {
        const d = new Date(c.updatedAt || c.createdAt);
        formattedTime = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch (e) {
        // ignore
      }
    }

    const chatDraft = draftsMap[c.id];

    if (c.isGroup) {
      return {
        id: c.id,
        name: c.groupName || "Encrypted Group",
        lastMessage: c.lastMessage || "Encrypted conversation established",
        timestamp: formattedTime,
        unread: c.unreadCount?.[currentUser.anonId] || 0,
        avatar: c.groupAvatar || "👥",
        isVerified: false,
        draft: chatDraft,
      };
    }

    const otherParticipant = c.participants?.find((p) => p !== currentUser.anonId) || c.participants?.[0] || "Anon Peer";
    const peerMeta = c.participantData?.[otherParticipant] || {
      name: otherParticipant,
      avatar: "👤",
      isVerified: false,
    };

    return {
      id: c.id,
      name: peerMeta.name || otherParticipant,
      lastMessage: c.lastMessage || "Encrypted conversation established",
      timestamp: formattedTime,
      unread: c.unreadCount?.[currentUser.anonId] || 0,
      avatar: peerMeta.avatar || "👤",
      isVerified: !!peerMeta.isVerified,
      draft: chatDraft,
    };
  });

  const filteredChats = mappedChats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#121217] relative selection:bg-purple-500/30">
      {/* Header */}
      <header className="bg-[#18181f]/90 backdrop-blur-xl px-4 py-3.5 flex items-center justify-between border-b border-white/[0.08] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 border border-purple-400/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base text-white font-bold tracking-tight font-display">anoNote</h1>
            <span className="text-[10px] text-purple-400 font-mono block -mt-0.5">End-to-End Encrypted</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Connect / Share Link Button */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95"
            title="Connect with friends via direct link or QR"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Connect</span>
          </button>

          {/* User Account / Identity Switcher */}
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-xl text-xs text-white transition-all active:scale-95"
            title="Manage or Switch Identity"
          >
            <span className="text-sm">{currentUser.avatar}</span>
            <span className="font-mono text-[11px] font-semibold text-gray-300 hidden xs:inline">
              {currentUser.anonId.replace("Anon #", "#")}
            </span>
          </button>

          <Link
            to="/new-chat"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Account / Identity Quick-Switch Dropdown */}
      {showAccountMenu && (
        <div className="absolute top-16 right-4 z-40 bg-[#1a1a24] border border-white/15 rounded-3xl w-72 p-3.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xl">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10.5px] text-purple-400 font-mono">{currentUser.anonId}</div>
              </div>
            </div>
            <button
              onClick={handleCopyMyLink}
              className="p-2 text-gray-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] rounded-xl transition-colors"
              title="Copy your connect link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            Saved Identities
          </p>

          <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
            {savedAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  switchAccount(acc.id);
                  setShowAccountMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                  acc.id === currentUser.id
                    ? "bg-purple-600/20 text-purple-200 font-semibold border border-purple-500/30"
                    : "hover:bg-white/[0.06] text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{acc.avatar}</span>
                  <span className="truncate">{acc.name}</span>
                </div>
                {acc.id === currentUser.id && <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
              </button>
            ))}
          </div>

          <div className="pt-2.5 border-t border-white/[0.08] space-y-1">
            <Link
              to="/signup"
              onClick={() => setShowAccountMenu(false)}
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-purple-400 hover:bg-purple-500/15 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Anon Identity</span>
            </Link>
            <Link
              to="/login"
              onClick={() => setShowAccountMenu(false)}
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-gray-300 hover:bg-white/[0.06] rounded-xl transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Log In with Another ID</span>
            </Link>
          </div>
        </div>
      )}

      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
            <span className="truncate">
              <strong>Offline Mode:</strong> Cached chats are accessible. Outgoing messages are queued in Dexie.
            </span>
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

      {/* QUICK CONNECT LINK BANNER */}
      <div className="bg-gradient-to-r from-[#181820] to-[#1e1e28] px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="text-xs text-gray-300 truncate">
            Your ID: <strong className="text-white font-mono">{currentUser.anonId}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleCopyMyLink}
            className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? "Copied" : "Copy Link"}</span>
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
          >
            <Share2 className="w-3 h-3" />
            <span>Connect</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher: Direct Chats vs Discover Network Peers */}
      <div className="flex border-b border-white/[0.06] bg-[#15151b] px-3 pt-2 gap-2">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === "chats"
              ? "bg-[#1e1e28] text-purple-300 border-t-2 border-purple-500 shadow-sm"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>My Chats ({mappedChats.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-t-xl transition-all ${
            activeTab === "discover"
              ? "bg-[#1e1e28] text-purple-300 border-t-2 border-purple-500 shadow-sm"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Peers ({activeNetworkUsers.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] bg-[#15151b]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "chats" ? "Search conversations..." : "Filter active network peers..."}
            className="w-full bg-[#1e1e28] border border-white/[0.08] focus:border-purple-500/60 rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto py-2">
        {activeTab === "chats" ? (
          filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600/15 to-indigo-600/15 border border-purple-500/20 flex items-center justify-center text-3xl shadow-inner">
                🔒
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">No Active Conversations Yet</h3>
                <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                  Send your secure connect link to a friend, or start a chat with another Anon ID to begin real-time end-to-end messaging.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs pt-2">
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-600/25 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Connect With Peer
                </button>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="flex-1 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-purple-300 border border-purple-500/30 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  View Active Peers
                </button>
              </div>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <Link key={chat.id} to={`/chat/${chat.id}`} className="block">
                <ChatListItem {...chat} isActive={currentOpenChatId === chat.id} />
              </Link>
            ))
          )
        ) : (
          /* Active Peers / Discover tab */
          <div className="p-2 space-y-1.5">
            <p className="text-[11px] text-gray-400 px-3 py-1">
              Active real users on anoNote network. Tap any Anon to start a direct encrypted chat.
            </p>
            {activeNetworkUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No other peers active right now. Share your link with friends to chat!
              </div>
            ) : (
              activeNetworkUsers
                .filter((u) => u.anonId.toLowerCase().includes(searchQuery.toLowerCase()) || (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                .map((peer) => (
                  <div
                    key={peer.anonId}
                    onClick={() => handleStartPeerChat(peer)}
                    className="flex items-center justify-between p-3 mx-1 rounded-2xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2a2a35] to-[#1c1c24] border border-white/10 flex items-center justify-center text-xl shadow-md">
                          {peer.avatar || "👤"}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121217]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {peer.name || peer.anonId}
                        </div>
                        <div className="text-[10px] text-purple-400 font-mono">{peer.anonId}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all">
                      <span>Message</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      <ConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </div>
  );
}
