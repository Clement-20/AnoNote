import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, MoreVertical, Send, Paperclip, Smile, Phone, Video, Palette, Mic, Trash2, Pin, X, Reply } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { ChatMenu } from "./ChatMenu";
import { ForwardMessageModal } from "./ForwardMessageModal";
import { WallpaperModal } from "./WallpaperModal";
import { VerifiedBadge } from "./VerifiedBadge";

const messagesData: Record<string, any[]> = {
  "1": [
    { id: "m1", text: "Hey! How are you doing?", isSent: false, timestamp: "2:30 PM", status: "read", reactions: { "👍": ["user2"] } },
    { id: "m2", text: "I'm doing great! Thanks for asking 😊", isSent: true, timestamp: "2:32 PM", status: "read", reactions: { "❤️": ["user1"] } },
    { id: "m3", text: "I wanted to talk to you about something interesting I discovered today", isSent: false, timestamp: "2:33 PM", status: "read" },
    { id: "m4", text: "That sounds interesting! Tell me more...", isSent: false, timestamp: "2:45 PM", status: "read", reactions: { "😂": ["user2"] } },
  ],
  "2": [
    { id: "m1", text: "Did you see the news today?", isSent: true, timestamp: "1:15 PM", status: "read" },
    { id: "m2", text: "Yes! It's quite surprising", isSent: false, timestamp: "1:20 PM", status: "read" },
    { id: "m3", text: "Thanks for sharing that", isSent: false, timestamp: "1:32 PM", status: "read", reactions: { "👍": ["user1"] } },
  ],
};

const chatNames: Record<string, string> = {
  "1": "Anon #3847", "2": "Anon #7291", "3": "Anon #5612", "4": "Anon #9204",
  "5": "Anon #4156", "6": "Anon #8873", "7": "Anon #2490", "8": "Anon #6371",
};

const chatAvatars: Record<string, string> = {
  "1": "👤", "2": "🕶️", "3": "🎭", "4": "👤",
  "5": "🌑", "6": "💭", "7": "🔮", "8": "🎪",
};

export function ChatViewDesktop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const currentChatId = id || "1";

  const [messagesMap, setMessagesMap] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem("anonote_messages_map");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return messagesData;
      }
    }
    return messagesData;
  });

  const [wallpaper, setWallpaper] = useState(() => {
    return localStorage.getItem(`anonote_wallpaper_${currentChatId}`) || "bg-[#0a0a0a]";
  });

  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [forwardingMsg, setForwardingMsg] = useState<string | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<{ id: string; text: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = messagesMap[currentChatId] || [
    { id: "m1", text: "Hello! Welcome to encrypted anonymous chat on anoNote.", isSent: false, timestamp: "12:00 PM", status: "read" }
  ];
  const chatName = chatNames[currentChatId] || `Anon #${currentChatId.slice(-4)}`;
  const chatAvatar = chatAvatars[currentChatId] || "👤";

  useEffect(() => {
    localStorage.setItem("anonote_messages_map", JSON.stringify(messagesMap));
  }, [messagesMap]);

  useEffect(() => {
    localStorage.setItem(`anonote_wallpaper_${currentChatId}`, wallpaper);
  }, [wallpaper, currentChatId]);

  // Emit 'message_read' event when user opens the chat
  useEffect(() => {
    const event = new CustomEvent("message_read", { detail: { chatId: currentChatId, userId: "me" } });
    window.dispatchEvent(event);

    setMessagesMap(prev => {
      const chatMessages = prev[currentChatId] || [];
      const updated = chatMessages.map(msg => ({ ...msg, status: "read" as const }));
      return { ...prev, [currentChatId]: updated };
    });
  }, [currentChatId]);

  const handleReply = (msg: any) => {
    setReplyingTo({
      id: msg.id,
      text: msg.text,
      senderName: msg.isSent ? "You" : chatName,
    });
    textInputRef.current?.focus();
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: `m_${Date.now()}`,
        text: message.trim(),
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered",
        replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.senderName,
        } : undefined,
      };
      setMessagesMap(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || messages), newMessage]
      }));
      setMessage("");
      setReplyingTo(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mediaUrl = URL.createObjectURL(file);
      const newMessage = {
        id: `m_${Date.now()}`,
        text: file.name ? `📷 ${file.name}` : "📷 Photo",
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered",
        mediaUrl,
        mediaType: "image" as const,
      };
      setMessagesMap(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || messages), newMessage]
      }));
    }
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const mediaUrl = URL.createObjectURL(audioBlob);
        const newMessage = {
          id: `m_${Date.now()}`,
          text: `Voice Note (${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, '0')})`,
          isSent: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "delivered",
          mediaUrl,
          mediaType: "audio" as const,
        };
        setMessagesMap(prev => ({
          ...prev,
          [currentChatId]: [...(prev[currentChatId] || messages), newMessage]
        }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = (send: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      if (send) {
        mediaRecorderRef.current.stop();
      } else {
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.stop();
      }
    } else if (send) {
      const simulatedBlob = new Blob([], { type: 'audio/webm' });
      const mediaUrl = URL.createObjectURL(simulatedBlob);
      const newMessage = {
        id: `m_${Date.now()}`,
        text: `Voice Note (${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, '0')})`,
        isSent: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "delivered",
        mediaUrl,
        mediaType: "audio" as const,
      };
      setMessagesMap(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || messages), newMessage]
      }));
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleForwardMessage = (targetChatId: string) => {
    if (!forwardingMsg) return;
    const forwarded = {
      id: `m_${Date.now()}`,
      text: `[Forwarded] ${forwardingMsg}`,
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "delivered",
    };
    setMessagesMap(prev => ({
      ...prev,
      [targetChatId]: [...(prev[targetChatId] || []), forwarded]
    }));
    setForwardingMsg(null);
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
    <div className={`flex flex-col h-full ${wallpaper} transition-colors duration-300`}>
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="lg:hidden text-purple-400 hover:text-purple-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Link to={`/chat/${currentChatId}/info`} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
              {chatAvatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-white font-medium text-base md:text-lg truncate">{chatName}</h2>
                {(["1", "2", "7"].includes(currentChatId)) && (
                  <VerifiedBadge size="sm" userName={chatName} />
                )}
              </div>
              <p className="text-xs text-purple-400 font-mono">End-to-End Encrypted</p>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button
            onClick={() => setShowWallpaperModal(true)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Change Chat Wallpaper"
          >
            <Palette className="w-5 h-5 md:w-6 md:h-6" />
          </button>
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

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="bg-[#1c1c1e]/90 backdrop-blur-md border-b border-purple-500/30 px-4 py-2.5 flex items-center justify-between text-xs z-10 shadow-md">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-4 h-4 text-purple-400 flex-shrink-0 rotate-45" />
            <span className="font-semibold text-purple-400 flex-shrink-0">Pinned Message:</span>
            <span className="text-gray-200 truncate">{pinnedMessage.text}</span>
          </div>
          <button
            onClick={() => setPinnedMessage(null)}
            className="text-gray-400 hover:text-white flex-shrink-0 ml-3 p-1"
            title="Unpin message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Menu */}
      {showMenu && <ChatMenu chatId={currentChatId} onClose={() => setShowMenu(false)} />}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-6 space-y-4">
        <div className="flex items-center justify-center">
          <span className="bg-[#1c1c1e] text-gray-400 text-xs px-3 py-1 rounded-full">
            Today
          </span>
        </div>
        {messages.map((msg: any) => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            isSent={msg.isSent}
            timestamp={msg.timestamp}
            status={msg.status}
            mediaUrl={msg.mediaUrl}
            mediaType={msg.mediaType}
            reactions={msg.reactions}
            replyTo={msg.replyTo}
            onReact={(emoji) => handleReact(msg.id, emoji)}
            onReply={() => handleReply(msg)}
            onForward={() => setForwardingMsg(msg.text)}
            onPin={() => setPinnedMessage({ id: msg.id, text: msg.text })}
          />
        ))}
      </div>

      {/* Input area / Voice recording bar */}
      <div className="bg-[#1c1c1e] px-4 md:px-6 lg:px-8 py-3 md:py-4 border-t border-gray-800">
        {/* Quoted Reply Preview */}
        {replyingTo && (
          <div className="max-w-4xl mx-auto mb-2.5 flex items-center justify-between bg-[#2c2c2e] border-l-4 border-purple-500 rounded-r-xl px-4 py-2.5 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Reply className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-400 truncate">
                  Replying to {replyingTo.senderName}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {replyingTo.text}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors ml-2 flex-shrink-0"
              title="Cancel reply"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isRecording ? (
          <div className="flex items-center justify-between max-w-4xl mx-auto bg-[#2c2c2e] rounded-3xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-mono text-sm">
                Recording voice note... {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stopRecording(false)}
                className="text-gray-400 hover:text-red-400 p-2 transition-colors"
                title="Cancel recording"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => stopRecording(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2.5 transition-colors flex items-center gap-1.5 px-4 text-sm font-medium"
                title="Send voice note"
              >
                <Send className="w-4 h-4" />
                Send Voice Note
              </button>
            </div>
          </div>
        ) : (
          <>
            {!message && (
              <div className="max-w-4xl mx-auto mb-2">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Keep it respectful. All messages are encrypted with zero-knowledge protocol on anoNote.
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 md:gap-3 max-w-4xl mx-auto">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Smile className="w-6 h-6" />
              </button>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white transition-colors"
                title="Upload image from camera or storage"
              >
                <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="flex-1 flex items-center bg-[#2c2c2e] rounded-3xl px-4 py-2 md:py-3">
                <input
                  ref={textInputRef}
                  type="text"
                  placeholder={replyingTo ? `Reply to ${replyingTo.senderName}...` : "Type a message..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm md:text-base"
                />
              </div>
              <button
                onClick={startRecording}
                className="text-gray-400 hover:text-purple-400 transition-colors p-2"
                title="Record voice note"
              >
                <Mic className="w-6 h-6" />
              </button>
              <button
                onClick={handleSend}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 md:p-3 transition-colors"
              >
                <Send className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </>
        )}
      </div>

      {showWallpaperModal && (
        <WallpaperModal
          currentWallpaper={wallpaper}
          onSelect={(wp) => setWallpaper(wp)}
          onClose={() => setShowWallpaperModal(false)}
        />
      )}

      {forwardingMsg && (
        <ForwardMessageModal
          messageText={forwardingMsg}
          onForward={handleForwardMessage}
          onClose={() => setForwardingMsg(null)}
        />
      )}
    </div>
  );
}
