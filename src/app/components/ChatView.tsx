import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, MoreVertical, Send, Paperclip, Smile, Phone, Video } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { VerifiedBadge } from "./VerifiedBadge";

const messagesData: Record<string, any[]> = {
  "1": [
    {
      id: "m1",
      text: "Hey! How are you doing?",
      isSent: false,
      timestamp: "2:30 PM",
      status: "read",
      reactions: { "👍": ["user2"] },
    },
    {
      id: "m2",
      text: "I'm doing great! Thanks for asking 😊",
      isSent: true,
      timestamp: "2:32 PM",
      status: "read",
      reactions: { "❤️": ["user1"] },
    },
    {
      id: "m3",
      text: "I wanted to talk to you about something interesting I discovered today",
      isSent: false,
      timestamp: "2:33 PM",
      status: "read",
    },
    {
      id: "m4",
      text: "That sounds interesting! Tell me more...",
      isSent: false,
      timestamp: "2:45 PM",
      status: "read",
    },
  ],
  "2": [
    {
      id: "m1",
      text: "Did you see the news today?",
      isSent: true,
      timestamp: "1:15 PM",
      status: "read",
    },
    {
      id: "m2",
      text: "Yes! It's quite surprising",
      isSent: false,
      timestamp: "1:20 PM",
      status: "read",
    },
    {
      id: "m3",
      text: "Thanks for sharing that",
      isSent: false,
      timestamp: "1:32 PM",
      status: "read",
      reactions: { "👍": ["user1"] },
    },
  ],
};

const chatNames: Record<string, string> = {
  "1": "Anon #3847",
  "2": "Anon #7291",
  "3": "Anon #5612",
  "4": "Anon #9204",
  "5": "Anon #4156",
  "6": "Anon #8873",
  "7": "Anon #2490",
  "8": "Anon #6371",
};

const chatAvatars: Record<string, string> = {
  "1": "👤",
  "2": "🕶️",
  "3": "🎭",
  "4": "👤",
  "5": "🌑",
  "6": "💭",
  "7": "🔮",
  "8": "🎪",
};

export function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>(messagesData);

  const currentChatId = id || "1";
  const messages = messagesMap[currentChatId] || [];
  const chatName = chatNames[currentChatId] || "Anon User";
  const chatAvatar = chatAvatars[currentChatId] || "👤";

  useEffect(() => {
    const event = new CustomEvent("message_read", { detail: { chatId: currentChatId, userId: "me" } });
    window.dispatchEvent(event);

    setMessagesMap(prev => {
      const chatMessages = prev[currentChatId] || [];
      const updated = chatMessages.map(msg => ({ ...msg, status: "read" as const }));
      return { ...prev, [currentChatId]: updated };
    });
  }, [currentChatId]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: `m_${Date.now()}`,
        text: message.trim(),
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered",
      };
      setMessagesMap(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || messages), newMessage]
      }));
      setMessage("");
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessagesMap(prev => {
      const chatMessages = prev[currentChatId] || messages;
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
      return { ...prev, [currentChatId]: updated };
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Link to={`/chat/${currentChatId}/info`} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl flex-shrink-0">
              {chatAvatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-white font-medium truncate">{chatName}</h2>
                {(["1", "2", "7"].includes(currentChatId)) && (
                  <VerifiedBadge size="sm" userName={chatName} />
                )}
              </div>
              <p className="text-xs text-purple-400 font-mono">End-to-End Encrypted</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Date separator */}
        <div className="flex items-center justify-center">
          <span className="bg-[#1c1c1e] text-gray-400 text-xs px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {/* Messages */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            isSent={msg.isSent}
            timestamp={msg.timestamp}
            status={msg.status}
            reactions={msg.reactions}
            onReact={(emoji) => handleReact(msg.id, emoji)}
          />
        ))}
      </div>

      {/* Input area */}
      <div className="bg-[#1c1c1e] px-4 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Smile className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center bg-[#2c2c2e] rounded-3xl px-4 py-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
            />
            <button className="text-gray-400 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSend}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
