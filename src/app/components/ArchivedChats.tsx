import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Archive } from "lucide-react";
import { ChatListItem } from "./ChatListItem";
import { useAuth } from "../context/AuthContext";
import {
  subscribeToUserChats,
  subscribeToActiveUsers,
  unarchiveChat,
  FirestoreChat,
} from "../services/chatService";

export function ArchivedChats() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [archivedChats, setArchivedChats] = useState<FirestoreChat[]>([]);
  const [activeNetworkUsers, setActiveNetworkUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.anonId) return;

    const unsubscribe = subscribeToUserChats(currentUser.anonId, (allChats) => {
      // Filter chats that are archived by this user
      const filtered = allChats.filter((c) => c.archivedBy?.[currentUser.anonId] === true);
      setArchivedChats(filtered);
    });

    return () => unsubscribe();
  }, [currentUser?.anonId]);

  useEffect(() => {
    if (!currentUser?.anonId) return;

    const unsub = subscribeToActiveUsers(currentUser.anonId, (users) => {
      setActiveNetworkUsers(users);
    });

    return () => unsub();
  }, [currentUser?.anonId]);

  const handleUnarchive = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await unarchiveChat(id, currentUser.anonId);
  };

  const mappedChats = archivedChats.map((c) => {
    let formattedTime = "Just now";
    if (c.updatedAt || c.createdAt) {
      try {
        const d = new Date(c.updatedAt || c.createdAt);
        formattedTime = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } catch (e) {
        // ignore
      }
    }

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
      isGroup: false,
      status: lastStatus,
    };
  });

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] font-sans select-none">
      {/* Header */}
      <header className="bg-[#111b21] px-4 py-3 flex items-center gap-3 border-b border-[#202c33] sticky top-0 z-20">
        <button
          onClick={() => navigate("/")}
          className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-[#e9edef] font-medium text-[16px]">Archived Chats</h2>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mappedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Archive className="w-12 h-12 text-[#8696a0] mb-3 opacity-60" />
            <p className="text-[#e9edef] text-sm font-medium">No archived chats</p>
            <p className="text-[#8696a0] text-xs mt-1 max-w-xs leading-relaxed">
              Archived conversations stay safe here and will not clutter your main inbox list.
            </p>
          </div>
        ) : (
          mappedChats.map((chat) => (
            <div
              key={chat.id}
              className="relative group flex items-center justify-between border-b border-[#202c33]/40 hover:bg-[#202c33]/40 transition-colors"
            >
              <Link to={`/chat/${chat.id}`} className="flex-1">
                <ChatListItem {...chat} />
              </Link>
              <button
                onClick={(e) => handleUnarchive(chat.id, e)}
                className="absolute right-4 bg-[#202c33] hover:bg-[#2a3942] text-[#38bdf8] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-[#2a3942] shadow-sm cursor-pointer z-30"
              >
                Unarchive
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
