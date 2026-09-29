import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router";
import {
  Search,
  Camera,
  MoreVertical,
  Plus,
  Radio,
  X,
  UserPlus,
  Share2,
  Copy,
  Check,
  Users,
  MessageSquare,
  Globe,
  WifiOff,
  Archive,
  MessageSquarePlus,
  Lock,
} from "lucide-react";
import { ChatListItem } from "./ChatListItem";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";
import {
  subscribeToUserChats,
  subscribeToActiveUsers,
  subscribeToAllUserDrafts,
  getOrCreateDirectChat,
  markMessagesAsDelivered,
  subscribeToBroadcast,
  FirestoreChat,
} from "../services/chatService";

// Synthesize a gorgeous high-fidelity double-beep notification sound
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(650, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.15);

    // Second note shortly after
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      gain2.gain.setValueAtTime(0.08, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.25);
    }, 80);
  } catch (e) {
    // Audio context may be suspended/blocked by browser autoplay policy
  }
}

export function ChatList() {
  const navigate = useNavigate();
  const { id: currentOpenChatId } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser, savedAccounts, switchAccount, getConnectUrl } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "groups">("all");
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [draftsMap, setDraftsMap] = useState<Record<string, string>>({});

  const [inAppToast, setInAppToast] = useState<{ title: string; body: string; chatId?: string } | null>(null);
  const lastProcessedTimestampsRef = useRef<Record<string, string>>({});
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

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

  const [firestoreChats, setFirestoreChats] = useState<FirestoreChat[]>([]);
  const [activeNetworkUsers, setActiveNetworkUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsubDrafts = subscribeToAllUserDrafts(currentUser.anonId, (drafts) => {
      setDraftsMap(drafts);
    });
    return () => unsubDrafts();
  }, [currentUser.anonId]);

  const [broadcast, setBroadcast] = useState("");

  useEffect(() => {
    const unsubBroadcast = subscribeToBroadcast((msg) => {
      if (msg) {
        const dismissed = sessionStorage.getItem(`anonote_dismissed_broadcast_${msg}`);
        if (dismissed) {
          setBroadcast("");
        } else {
          setBroadcast(msg);
        }
      } else {
        setBroadcast("");
      }
    });
    return () => unsubBroadcast();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUserChats(currentUser.anonId, (chats) => {
      // Trace new messages for notifications
      if (chats.length > 0) {
        if (!isFirstLoadRef.current) {
          chats.forEach((c) => {
            const lastStamp = c.lastMessageTimestamp;
            const prevStamp = lastProcessedTimestampsRef.current[c.id];
            
            // Trigger notification if there is a new message from a peer (not us and not system)
            if (
              lastStamp &&
              lastStamp !== prevStamp &&
              c.lastSenderId &&
              c.lastSenderId !== currentUser.anonId &&
              c.lastSenderId !== "system"
            ) {
              const peerName = c.isGroup
                ? c.groupName || "Encrypted Group"
                : (c.participantData?.[c.lastSenderId]?.name || `Anon #${c.lastSenderId.substring(0, 5)}`);
              
              const secureBody = c.lastMessage || "New message received";
              const secureTitle = c.isGroup ? `💬 Group Alert: ${peerName}` : `💬 Message from ${peerName}`;

              // Trigger HTML5 and Audio notification if this chat is not currently open
              if (currentOpenChatId !== c.id) {
                // Play audio + show browser Push Notification + in-app Toast
                playNotificationSound();

                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  try {
                    const notif = new Notification(secureTitle, {
                      body: secureBody,
                      icon: "🛡️",
                      tag: c.id,
                      silent: true,
                    });
                    notif.onclick = () => {
                      window.focus();
                      navigate(`/chat/${c.id}`);
                    };
                  } catch (err) {
                    console.warn(err);
                  }
                }

                // Trigger floating top toast inside app viewport
                setInAppToast({ title: secureTitle, body: secureBody, chatId: c.id });
                setTimeout(() => {
                  setInAppToast(null);
                }, 4000);
              }
            }
          });
        }

        // Always save last timestamps
        chats.forEach((c) => {
          if (c.lastMessageTimestamp) {
            lastProcessedTimestampsRef.current[c.id] = c.lastMessageTimestamp;
          }
        });
        isFirstLoadRef.current = false;
      }

      setFirestoreChats(chats);
      localStorage.setItem("anonote_chats_cache", JSON.stringify(chats));

      // Mark unread chats as delivered on this recipient's active device
      chats.forEach((c) => {
        if (c.lastSenderId && c.lastSenderId !== currentUser.anonId && c.lastMessageStatus === "sent") {
          markMessagesAsDelivered(c.id, []);
        }
      });
    });
    return () => unsubscribe();
  }, [currentUser.anonId, currentOpenChatId, navigate]);

  useEffect(() => {
    const unsub = subscribeToActiveUsers(currentUser.anonId, (users) => {
      setActiveNetworkUsers(users);
    });
    return () => unsub();
  }, [currentUser.anonId]);

  // Handle direct connect URL param
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

      getOrCreateDirectChat(currentUser, peerName).then((chatId) => {
        navigate(`/chat/${chatId}`, { replace: true });
      });
    }
  }, [searchParams, currentUser, navigate]);

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
    const isLastMessageFromMe = c.lastSenderId === currentUser.anonId;
    const lastStatus = isLastMessageFromMe ? (c.lastMessageStatus || "sent") : undefined;

    if (c.isGroup) {
      return {
        id: c.id,
        name: c.groupName || "Encrypted Group",
        lastMessage: c.lastMessage || "Group conversation created",
        timestamp: formattedTime,
        unread: c.unreadCount?.[currentUser.anonId] || 0,
        avatar: c.groupAvatar || "👥",
        isVerified: false,
        draft: chatDraft,
        isGroup: true,
        status: lastStatus,
      };
    }

    const otherParticipant = c.participants?.find((p) => p !== currentUser.anonId);
    const livePeer = otherParticipant && activeNetworkUsers.find(
      (u) => u.anonId?.trim().toLowerCase() === otherParticipant.trim().toLowerCase()
    );

    const peerData = otherParticipant && c.participantData?.[otherParticipant];
    const peerName = livePeer?.name || peerData?.name || otherParticipant || "Anon Peer";
    const peerAvatar = livePeer?.avatar || peerData?.avatar || "👤";
    const isPeerVerified = livePeer?.isVerified !== undefined ? !!livePeer.isVerified : !!peerData?.isVerified;

    return {
      id: c.id,
      name: peerName,
      lastMessage: c.lastMessage || "Encrypted conversation established",
      timestamp: formattedTime,
      unread: c.unreadCount?.[currentUser.anonId] || 0,
      avatar: peerAvatar,
      isVerified: isPeerVerified,
      draft: chatDraft,
      isGroup: false,
      status: lastStatus,
    };
  });

  const totalUnreadChats = mappedChats.filter((c) => c.unread > 0).length;

  const filteredChats = mappedChats.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "unread") return chat.unread > 0;
    if (activeFilter === "groups") return chat.isGroup;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none relative">
      {/* Real-time In-App Floating Toast Push Notification */}
      {inAppToast && (
        <div
          onClick={() => {
            if (inAppToast.chatId) {
              navigate(`/chat/${inAppToast.chatId}`);
            }
            setInAppToast(null);
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#202c33] border border-[#0084ff]/30 rounded-xl px-4 py-3 shadow-2xl max-w-sm w-[90%] flex items-center gap-3 cursor-pointer animate-in slide-in-from-top duration-300 hover:bg-[#2a3942]"
        >
          <div className="w-9 h-9 rounded-full bg-[#0084ff]/15 flex items-center justify-center text-lg flex-shrink-0">
            💬
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-[#38bdf8] truncate">{inAppToast.title}</h4>
            <p className="text-[12px] text-[#e9edef] truncate">{inAppToast.body}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInAppToast(null);
            }}
            className="text-[#8696a0] hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AnoNote Clean Top App Bar */}
      <header className="px-4 py-3 bg-[#111b21] flex items-center justify-between z-30">
        <h1 className="text-[20px] font-semibold text-[#e9edef] tracking-tight">AnoNote</h1>
        <div className="flex items-center gap-4 text-[#aebac1]">
          <button
            onClick={() => setShowConnectModal(true)}
            className="hover:text-[#e9edef] transition-colors"
            title="Scan QR / Share Link"
          >
            <Camera className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:text-[#e9edef] transition-colors p-1"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* AnoNote Dropdown Menu */}
            {showMenu && (
              <div
                className="absolute top-8 right-0 w-52 bg-[#202c33] rounded-md shadow-xl py-2 z-50 text-[#e9edef] text-sm border border-[#2a3942]"
                onClick={() => setShowMenu(false)}
              >
                <Link to="/new-group" className="block px-4 py-2 hover:bg-[#111b21] transition-colors">
                  New group
                </Link>
                <Link to="/new-chat" className="block px-4 py-2 hover:bg-[#111b21] transition-colors">
                  New chat
                </Link>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="w-full text-left px-4 py-2 hover:bg-[#111b21] transition-colors"
                >
                  Linked devices / QR
                </button>
                <Link to="/archived" className="block px-4 py-2 hover:bg-[#111b21] transition-colors">
                  Archived chats
                </Link>
                <Link to="/settings" className="block px-4 py-2 hover:bg-[#111b21] transition-colors">
                  Settings
                </Link>
                <div className="h-px bg-[#2a3942] my-1" />
                <Link to="/profile" className="block px-4 py-2 hover:bg-[#111b21] transition-colors text-xs text-[#8696a0]">
                  Logged in as <strong className="text-[#e9edef]">{currentUser.anonId}</strong>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Offline Alert */}
      {!isOnline && (
        <div className="bg-[#182229] border-b border-[#202c33] px-4 py-2 flex items-center justify-between text-xs text-[#8696a0]">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[#f15c6d] flex-shrink-0" />
            <span>Waiting for network...</span>
          </div>
        </div>
      )}

      {/* Broadcast Announcement */}
      {broadcast && (
        <div className="bg-[#182229] border-b border-[#202c33] px-4 py-2 flex items-center justify-between text-xs text-[#38bdf8]">
          <div className="flex items-center gap-2 truncate">
            <Radio className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span className="truncate">{broadcast}</span>
          </div>
          <button
            onClick={() => {
              sessionStorage.setItem(`anonote_dismissed_broadcast_${broadcast}`, "true");
              setBroadcast("");
            }}
            className="text-[#8696a0] hover:text-[#e9edef] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="px-3 pt-2 pb-2 bg-[#111b21]">
        <div className="flex items-center bg-[#202c33] rounded-full px-3.5 py-1.5 text-[#8696a0]">
          <Search className="w-4 h-4 mr-2.5 flex-shrink-0 text-[#8696a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="bg-transparent text-[#e9edef] placeholder-[#8696a0] outline-none flex-1 text-[14px]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#8696a0] hover:text-[#e9edef]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Pills (All, Unread, Groups) */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111b21] border-b border-[#202c33]">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            activeFilter === "all" ? "bg-[#0c3a5e] text-[#38bdf8]" : "bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter("unread")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
            activeFilter === "unread" ? "bg-[#0c3a5e] text-[#38bdf8]" : "bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]"
          }`}
        >
          <span>Unread</span>
          {totalUnreadChats > 0 && (
            <span className="bg-[#0084ff] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
              {totalUnreadChats}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveFilter("groups")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            activeFilter === "groups" ? "bg-[#0c3a5e] text-[#38bdf8]" : "bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]"
          }`}
        >
          Groups
        </button>
      </div>

      {/* Archived Chats Header Row */}
      <Link
        to="/archived"
        className="flex items-center justify-between px-4 py-3 hover:bg-[#202c33]/40 border-b border-[#202c33]/50 transition-colors text-[#8696a0] hover:text-[#e9edef]"
      >
        <div className="flex items-center gap-4">
          <Archive className="w-5 h-5 text-[#8696a0]" />
          <span className="text-[15px] font-medium text-[#e9edef]">Archived</span>
        </div>
        <span className="text-xs text-[#38bdf8] font-medium font-mono">0</span>
      </Link>

      {/* Main Chat Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-[#8696a0]">
            <div className="w-14 h-14 rounded-full bg-[#111b21] flex items-center justify-center text-2xl mb-3 text-[#0084ff]">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-[#e9edef] font-medium text-base mb-1">No chats yet</h3>
            <p className="text-xs text-[#8696a0] max-w-xs mb-4">
              Tap the blue message button below to start a chat with any Anon ID or create a group.
            </p>
            <button
              onClick={() => navigate("/new-chat")}
              className="px-4 py-2 bg-[#0084ff] hover:bg-[#0070df] text-white font-semibold rounded-full text-xs transition-colors"
            >
              Start Chat
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <Link key={chat.id} to={`/chat/${chat.id}`} className="block">
              <ChatListItem {...chat} isActive={currentOpenChatId === chat.id} />
            </Link>
          ))
        )}
      </div>

      {/* Blue Floating Action Button (FAB) */}
      <button
        onClick={() => navigate("/new-chat")}
        className="fixed lg:absolute bottom-20 lg:bottom-6 right-5 w-14 h-14 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 z-30"
        title="New Chat"
      >
        <MessageSquarePlus className="w-6 h-6 text-white" />
      </button>

      <ConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </div>
  );
}
