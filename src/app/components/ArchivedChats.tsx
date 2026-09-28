import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Archive } from "lucide-react";
import { ChatListItem } from "./ChatListItem";

const initialArchivedChats = [
  {
    id: "archived-1",
    name: "Anon #9999",
    lastMessage: "Archived conversation history",
    timestamp: "Last week",
    unread: 0,
    avatar: "📦",
  },
];

export function ArchivedChats() {
  const navigate = useNavigate();
  const [archivedChats, setArchivedChats] = useState(initialArchivedChats);

  const handleUnarchive = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArchivedChats(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={() => navigate("/settings")}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-medium text-lg">Archived Chats</h2>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {archivedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Archive className="w-12 h-12 text-gray-600 mb-2" />
            <p className="text-gray-400 text-sm">No archived chats</p>
            <p className="text-gray-500 text-xs mt-1">Inactive conversations moved here will appear in this section.</p>
          </div>
        ) : (
          archivedChats.map((chat) => (
            <div key={chat.id} className="relative group flex items-center justify-between border-b border-gray-800 hover:bg-[#1c1c1e] transition-colors">
              <Link to={`/chat/${chat.id}`} className="flex-1">
                <ChatListItem {...chat} />
              </Link>
              <button
                onClick={(e) => handleUnarchive(chat.id, e)}
                className="absolute right-4 bg-[#2c2c2e] hover:bg-purple-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow"
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
