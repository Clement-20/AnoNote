import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, MoreVertical, ShieldCheck, Plus, Archive, BadgeCheck } from "lucide-react";
import { ChatListItem } from "./ChatListItem";

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
    lastMessage: "Can we talk about this tomorrow?",
    timestamp: "Yesterday",
    unread: 5,
    avatar: "👤",
    isVerified: false,
  },
  {
    id: "5",
    name: "Anon #4156",
    lastMessage: "You: That's perfect!",
    timestamp: "Wednesday",
    unread: 0,
    avatar: "🌑",
    isVerified: false,
  },
  {
    id: "6",
    name: "Anon #8873",
    lastMessage: "I completely understand",
    timestamp: "Tuesday",
    unread: 0,
    avatar: "💭",
    isVerified: false,
  },
  {
    id: "7",
    name: "Anon #2490",
    lastMessage: "You: When do you want to meet?",
    timestamp: "Monday",
    unread: 0,
    avatar: "🔮",
    isVerified: true,
  },
  {
    id: "8",
    name: "Anon #6371",
    lastMessage: "Sounds good to me",
    timestamp: "2/1/26",
    unread: 0,
    avatar: "🎪",
    isVerified: false,
  },
];

export function ChatList() {
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    localStorage.setItem("anonote_chats", JSON.stringify(chats));
  }, [chats]);

  const filteredChats = chats.filter(
    (chat: any) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-xl text-white font-semibold tracking-tight">anoNote</h1>
            <span className="text-[10px] text-purple-400/80 block -mt-1 font-mono">anoNote.icepab.name.ng</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/new-chat" className="text-gray-400 hover:text-white transition-colors" title="New Chat">
            <Plus className="w-5 h-5" />
          </Link>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

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
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <p className="text-gray-400 text-sm">No chats found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredChats.map((chat: any) => (
            <Link key={chat.id} to={`/chat/${chat.id}`} className="block">
              <ChatListItem {...chat} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
