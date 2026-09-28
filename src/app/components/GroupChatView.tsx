import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, MoreVertical, Send, Paperclip, Smile, Phone, Video } from "lucide-react";
import { GroupMessageBubble } from "./GroupMessageBubble";
import { GroupChatMenu } from "./GroupChatMenu";

// Mock group messages data with sample reactions
const groupMessagesData: Record<string, any[]> = {
  "g1": [
    { id: "gm1", text: "Hey everyone! 👋", senderId: "1", senderName: "Anon #3847", senderAvatar: "👤", timestamp: "2:30 PM", isSent: false, reactions: { "👍": ["user2"] } },
    { id: "gm2", text: "Hello! How's everyone doing?", senderId: "2", senderName: "Anon #7291", senderAvatar: "🕶️", timestamp: "2:31 PM", isSent: false },
    { id: "gm3", text: "Great to see everyone here!", senderId: "me", senderName: "You", senderAvatar: "🎭", timestamp: "2:32 PM", isSent: true, reactions: { "❤️": ["user1"] } },
    { id: "gm4", text: "Should we plan the next meetup?", senderId: "1", senderName: "Anon #3847", senderAvatar: "👤", timestamp: "2:35 PM", isSent: false },
    { id: "gm5", text: "Yes! I'm available this weekend", senderId: "me", senderName: "You", senderAvatar: "🎭", timestamp: "2:36 PM", isSent: true },
  ],
};

const groupInfo: Record<string, any> = {
  "g1": {
    name: "Anonymous Friends 👥",
    avatar: "👥",
    members: 8,
    description: "A secure circle for anonymous discussions on anoNote",
  },
};

export function GroupChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>(groupMessagesData);

  const currentGroupId = id || "g1";
  const messages = messagesMap[currentGroupId] || [];
  const group = groupInfo[currentGroupId] || groupInfo["g1"];

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: `gm_${Date.now()}`,
        text: message.trim(),
        senderId: "me",
        senderName: "You",
        senderAvatar: "🎭",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
      };
      setMessagesMap(prev => ({
        ...prev,
        [currentGroupId]: [...(prev[currentGroupId] || messages), newMessage]
      }));
      setMessage("");
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessagesMap(prev => {
      const chatMessages = prev[currentGroupId] || messages;
      const updated = chatMessages.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          const currentReacted = reactions[emoji] || [];
          if (Array.isArray(currentReacted)) {
            if (currentReacted.includes("me")) {
              reactions[emoji] = currentReacted.filter((u: string) => u !== "me");
              if (reactions[emoji].length === 0) delete reactions[emoji];
            } else {
              reactions[emoji] = [...currentReacted, "me"];
            }
          } else {
            const count = Number(currentReacted) || 0;
            reactions[emoji] = count > 0 ? 0 : ["me"];
            if (reactions[emoji] === 0) delete reactions[emoji];
          }
          return { ...msg, reactions };
        }
        return msg;
      });
      return { ...prev, [currentGroupId]: updated };
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="lg:hidden text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Link to={`/group/${currentGroupId}/info`} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
              {group.avatar}
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-medium text-base md:text-lg truncate">{group.name}</h2>
              <p className="text-xs text-gray-400">{group.members} members</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Video className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Phone className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white transition-colors relative"
          >
            <MoreVertical className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      {/* Group Chat Menu */}
      {showMenu && <GroupChatMenu groupId={currentGroupId} onClose={() => setShowMenu(false)} />}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 space-y-4">
        <div className="flex items-center justify-center">
          <span className="bg-[#1c1c1e] text-gray-400 text-xs px-3 py-1 rounded-full">
            Today
          </span>
        </div>
        {messages.map((msg) => (
          <GroupMessageBubble
            key={msg.id}
            text={msg.text}
            senderName={msg.senderName}
            senderAvatar={msg.senderAvatar}
            isSent={msg.isSent}
            timestamp={msg.timestamp}
            reactions={msg.reactions}
            onReact={(emoji) => handleReact(msg.id, emoji)}
          />
        ))}
      </div>

      {/* Input area */}
      <div className="bg-[#1c1c1e] px-4 md:px-6 lg:px-8 py-3 md:py-4 border-t border-gray-800">
        {!message && (
          <div className="max-w-4xl mx-auto mb-2">
            <p className="text-xs text-gray-500 text-center">
              🔒 Keep it respectful. All group messages are end-to-end encrypted on anoNote.
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 md:gap-3 max-w-4xl mx-auto">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Smile className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center bg-[#2c2c2e] rounded-3xl px-4 py-2 md:py-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm md:text-base"
            />
            <button className="text-gray-400 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSend}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 md:p-3 transition-colors"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
