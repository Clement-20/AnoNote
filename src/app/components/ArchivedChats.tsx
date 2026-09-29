import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Archive } from "lucide-react";
import { ChatListItem } from "./ChatListItem";

const initialArchivedChats = [
  {
    id: "archived-1",
    name: "Anon #9999",
    lastMessage: "Archived conversation history",
    timestamp: "Yesterday",
    unread: 0,
    avatar: "👤",
  },
];

export function ArchivedChats() {
  const navigate = useNavigate();
  const [archivedChats, setArchivedChats] = useState(initialArchivedChats);

  const handleUnarchive = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArchivedChats((prev) => prev.filter((c) => c.id !== id));
  };

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
          <h2 className="text-[#e9edef] font-medium text-[16px]">Archived</h2>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {archivedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Archive className="w-12 h-12 text-[#8696a0] mb-2" />
            <p className="text-[#e9edef] text-sm">No archived chats</p>
            <p className="text-[#8696a0] text-xs mt-1">Archived conversations will stay stored here.</p>
          </div>
        ) : (
          archivedChats.map((chat) => (
            <div
              key={chat.id}
              className="relative group flex items-center justify-between border-b border-[#202c33]/40 hover:bg-[#202c33]/40 transition-colors"
            >
              <Link to={`/chat/${chat.id}`} className="flex-1">
                <ChatListItem {...chat} />
              </Link>
              <button
                onClick={(e) => handleUnarchive(chat.id, e)}
                className="absolute right-4 bg-[#202c33] hover:bg-[#2a3942] text-[#38bdf8] px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-[#2a3942]"
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
