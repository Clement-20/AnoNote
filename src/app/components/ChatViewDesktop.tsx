import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, MoreVertical, Send, Paperclip, Phone, Video, Palette, Mic, Trash2, Pin, X, Reply, WifiOff, AtSign } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { ChatMenu } from "./ChatMenu";
import { ForwardMessageModal } from "./ForwardMessageModal";
import { WallpaperModal } from "./WallpaperModal";
import { VerifiedBadge } from "./VerifiedBadge";
import { GroupTagAutocomplete, TagCandidate } from "./GroupTagAutocomplete";
import { useAuth } from "../context/AuthContext";
import {
  subscribeToMessages,
  subscribeToChatMetadata,
  sendChatMessage,
  toggleMessageReaction,
  subscribeToChatDraft,
  saveChatDraft,
  deleteChatDraft,
  subscribeToQueueCount,
  FirestoreMessage,
} from "../services/chatService";

export function ChatViewDesktop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    const unsubQueue = subscribeToQueueCount((count) => {
      setQueuedCount(count);
    });
    return () => unsubQueue();
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

  const currentChatId = id || "general";

  const [firestoreMessages, setFirestoreMessages] = useState<FirestoreMessage[]>([]);
  const [wallpaper, setWallpaper] = useState(() => {
    return localStorage.getItem(`anonote_wallpaper_${currentChatId}`) || "bg-[#0a0a0a]";
  });

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCursorPos, setMentionCursorPos] = useState<number>(0);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState<number>(0);

  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [forwardingMsg, setForwardingMsg] = useState<string | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<{ id: string; text: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const draftLoadedRef = useRef(false);
  const saveDraftTimerRef = useRef<any>(null);

  // Subscribe and load draft for this chat
  useEffect(() => {
    draftLoadedRef.current = false;
    setMessage("");
    setReplyingTo(null);

    const unsubscribe = subscribeToChatDraft(currentUser.anonId, currentChatId, (draft) => {
      if (!draftLoadedRef.current) {
        draftLoadedRef.current = true;
        if (draft) {
          setMessage(draft.text || "");
          if (draft.replyTo) {
            setReplyingTo(draft.replyTo);
          }
        }
      }
    });

    return () => {
      unsubscribe();
      draftLoadedRef.current = false;
    };
  }, [currentChatId, currentUser.anonId]);

  // Debounced auto-save draft to Firestore
  useEffect(() => {
    if (!draftLoadedRef.current) return;

    if (saveDraftTimerRef.current) {
      clearTimeout(saveDraftTimerRef.current);
    }

    saveDraftTimerRef.current = setTimeout(() => {
      saveChatDraft(currentUser.anonId, currentChatId, message, replyingTo);
    }, 300);

    return () => {
      if (saveDraftTimerRef.current) {
        clearTimeout(saveDraftTimerRef.current);
      }
    };
  }, [message, replyingTo, currentChatId, currentUser.anonId]);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time message listener from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToMessages(currentChatId, (msgs) => {
      setFirestoreMessages(msgs);
    });
    return () => unsubscribe();
  }, [currentChatId]);

  const [liveChatDoc, setLiveChatDoc] = useState<any>(null);

  useEffect(() => {
    const unsub = subscribeToChatMetadata(currentChatId, (docData) => {
      setLiveChatDoc(docData);
    });
    return () => unsub();
  }, [currentChatId]);

  // Dynamic peer/group metadata lookup from chat ID & live doc
  const chatMeta = (() => {
    if (liveChatDoc?.isGroup) {
      return {
        name: liveChatDoc.groupName || "Encrypted Group",
        avatar: liveChatDoc.groupAvatar || "👥",
        isVerified: false,
        isGroup: true,
        participantsCount: liveChatDoc.participants?.length || 2,
      };
    }

    if (currentChatId.startsWith("group_")) {
      return {
        name: "Encrypted Group",
        avatar: "👥",
        isVerified: false,
        isGroup: true,
        participantsCount: 2,
      };
    }

    // If chat ID is a direct chat (chat_anon1__anon2), extract peer ID
    if (currentChatId.startsWith("chat_")) {
      const parts = currentChatId.replace("chat_", "").split("__");
      const myClean = currentUser.anonId.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const peerClean = parts.find((p) => p !== myClean) || parts[0];
      const otherParticipant = liveChatDoc?.participants?.find((p: string) => p !== currentUser.anonId);
      const peerData = otherParticipant && liveChatDoc?.participantData?.[otherParticipant];
      const displayName = peerData?.name || `Anon #${peerClean.replace(/[^0-9]/g, "") || peerClean}`;
      return {
        name: displayName,
        avatar: peerData?.avatar || "👤",
        isVerified: !!peerData?.isVerified,
        isGroup: false,
      };
    }

    if (currentChatId.startsWith("peer_")) {
      return {
        name: "Direct Peer",
        avatar: "👤",
        isVerified: false,
        isGroup: false,
      };
    }

    if (currentChatId.startsWith("Anon")) {
      return {
        name: currentChatId,
        avatar: "👤",
        isVerified: false,
        isGroup: false,
      };
    }

    return {
      name: `Anon #${currentChatId.replace(/[^0-9a-zA-Z]/g, "") || currentChatId}`,
      avatar: "👤",
      isVerified: false,
      isGroup: false,
    };
  })();

  const chatName = chatMeta.name;
  const chatAvatar = chatMeta.avatar;
  const isChatVerified = chatMeta.isVerified;

  // Transform firestore messages to UI bubble format
  const messages = firestoreMessages.map((m) => ({
    id: m.id,
    text: m.text,
    isSent: m.senderAnonId === currentUser.anonId,
    timestamp: m.timestamp || "Just now",
    status: m.status || "delivered",
    isPending: m.isPending,
    mediaUrl: m.mediaUrl,
    mediaType: m.mediaType,
    senderName: m.senderName || m.senderAnonId,
    reactions: m.reactions || {},
  }));

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    localStorage.setItem(`anonote_wallpaper_${currentChatId}`, wallpaper);
  }, [wallpaper, currentChatId]);

  const handleReact = async (msgId: string, emoji: string) => {
    await toggleMessageReaction(currentChatId, msgId, emoji, currentUser.anonId);
  };

  const handleReply = (msg: any) => {
    setReplyingTo({
      id: msg.id,
      text: msg.text,
      senderName: msg.isSent ? "You" : chatName,
    });
    textInputRef.current?.focus();
  };

  // Extract participants for mentions
  const participantsList = (() => {
    if (liveChatDoc?.participants && Array.isArray(liveChatDoc.participants)) {
      return liveChatDoc.participants.map((pId: string) => {
        const pData = liveChatDoc.participantData?.[pId];
        return {
          anonId: pId,
          name: pData?.name || pId,
          avatar: pData?.avatar || "👤",
        };
      });
    }
    return [
      { anonId: currentUser.anonId, name: currentUser.name, avatar: currentUser.avatar },
      { anonId: chatName, name: chatName, avatar: chatAvatar },
    ];
  })();

  const allTagCandidates: TagCandidate[] = [
    { tag: "@all", label: "@all", description: "Notify everyone in this room", isSpecial: true },
    { tag: "@online", label: "@online", description: "Notify currently active online peers", isSpecial: true },
    ...participantsList.map((p) => ({
      tag: `@${p.anonId}`,
      label: p.name && p.name !== p.anonId ? `${p.name} (${p.anonId})` : p.anonId,
      description: "Group Participant",
      avatar: p.avatar,
    })),
  ];

  const filteredTags = allTagCandidates.filter((item) => {
    if (mentionQuery === null || mentionQuery === "") return true;
    const cleanQ = mentionQuery.toLowerCase().replace("@", "");
    return (
      item.tag.toLowerCase().includes(cleanQ) ||
      item.label.toLowerCase().includes(cleanQ) ||
      item.description.toLowerCase().includes(cleanQ)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart || val.length;
    setMessage(val);

    // Detect @mention trigger in the word before cursor
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/(?:^|\s)@([a-zA-Z0-9_#-]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionCursorPos(cursor);
      setMentionSelectedIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (tag: string) => {
    const textBefore = message.slice(0, mentionCursorPos);
    const textAfter = message.slice(mentionCursorPos);
    const lastAtPos = textBefore.lastIndexOf("@");
    if (lastAtPos !== -1) {
      const newText = textBefore.slice(0, lastAtPos) + tag + " " + textAfter;
      setMessage(newText);
      setMentionQuery(null);
      setTimeout(() => {
        textInputRef.current?.focus();
        const newPos = lastAtPos + tag.length + 1;
        textInputRef.current?.setSelectionRange(newPos, newPos);
      }, 10);
    }
  };

  const handleTriggerMention = () => {
    const input = textInputRef.current;
    const cursor = input?.selectionStart || message.length;
    const newText = message.slice(0, cursor) + "@" + message.slice(cursor);
    setMessage(newText);
    setMentionQuery("");
    setMentionCursorPos(cursor + 1);
    setMentionSelectedIndex(0);
    setTimeout(() => {
      input?.focus();
      input?.setSelectionRange(cursor + 1, cursor + 1);
    }, 10);
  };

  const handleSend = async () => {
    if (message.trim()) {
      const textToSend = replyingTo ? `↳ Replying to: "${replyingTo.text.slice(0, 30)}..."\n${message.trim()}` : message.trim();
      const targetChatId = currentChatId;
      setMessage("");
      setReplyingTo(null);
      setMentionQuery(null);
      await deleteChatDraft(currentUser.anonId, targetChatId);
      await sendChatMessage(targetChatId, currentUser, textToSend);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        await sendChatMessage(currentChatId, currentUser, file.name ? `📷 ${file.name}` : "📷 Photo", "image", base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Audio = reader.result as string;
          await sendChatMessage(
            currentChatId,
            currentUser,
            `Voice Note (${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, "0")})`,
            "audio",
            base64Audio
          );
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  const stopRecording = (send: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      if (send) {
        mediaRecorderRef.current.stop();
      } else {
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current.stop();
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleForwardMessage = async (targetChatId: string) => {
    if (!forwardingMsg) return;
    await sendChatMessage(targetChatId, currentUser, `[Forwarded] ${forwardingMsg}`);
    setForwardingMsg(null);
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear your local view of this chat?")) {
      setFirestoreMessages([]);
    }
  };

  return (
    <div className={`flex flex-col h-full ${wallpaper} relative transition-colors duration-300`}>
      {/* Hidden File Input for Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <header className="bg-[#181820]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-white/[0.08] z-10 shadow-sm sticky top-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="lg:hidden text-gray-400 hover:text-white p-1.5 -ml-1 rounded-xl hover:bg-white/[0.06] transition-colors flex-shrink-0"
            title="Back to chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <Link to={`/chat-info/${currentChatId}`} className="flex items-center gap-3 min-w-0 group">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2a2a35] to-[#1c1c24] border border-white/15 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
                {chatAvatar}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#181820]" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-white font-bold text-sm md:text-base truncate group-hover:text-purple-300 transition-colors font-display">
                  {chatName}
                </h2>
                {isChatVerified && (
                  <VerifiedBadge size="sm" userName={chatName} />
                )}
              </div>
              {isOnline ? (
                queuedCount > 0 ? (
                  <p className="text-[11px] text-purple-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
                    Syncing {queuedCount} queued message{queuedCount > 1 ? 's' : ''}...
                  </p>
                ) : chatMeta.isGroup ? (
                  <p className="text-[11px] text-purple-300 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {chatMeta.participantsCount} participants · Live Sync
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Live Cloud Sync
                  </p>
                )
              ) : (
                <p className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  Offline ({queuedCount} queued in Dexie)
                </p>
              )}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button 
            onClick={() => setShowWallpaperModal(true)}
            className="text-gray-400 hover:text-purple-300 p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
            title="Custom Chat Wallpaper"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => navigate(`/call/${currentChatId}`)}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
            title="Encrypted Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate(`/call/${currentChatId}?video=true`)}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
            title="Encrypted Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.08] transition-colors"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <ChatMenu 
              isOpen={showMenu}
              chatId={currentChatId}
              onClose={() => setShowMenu(false)}
              onClearChat={handleClearChat}
              onWallpaperClick={() => setShowWallpaperModal(true)}
            />
          </div>
        </div>
      </header>

      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-10 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
            <span className="truncate">
              <strong>Offline Mode Active:</strong> Messages will queue in Dexie and send automatically when connection returns.
            </span>
          </div>
        </div>
      )}

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="bg-[#181820]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-2 flex items-center justify-between text-xs text-gray-300 z-10 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="text-gray-400">Pinned:</span>
            <span className="truncate font-medium text-white">{pinnedMessage.text}</span>
          </div>
          <button 
            onClick={() => setPinnedMessage(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-14 px-4 space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-3xl shadow-inner">
              💬
            </div>
            <div>
              <p className="text-gray-200 text-sm font-bold font-display">Encrypted Channel Ready</p>
              <p className="text-gray-400 text-xs max-w-xs mt-1 leading-relaxed">
                Messages in this room are end-to-end encrypted and synced live in real-time.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              {...msg}
              currentUserAnonId={currentUser.anonId}
              onReact={(emoji) => handleReact(msg.id, emoji)}
              onPin={() => setPinnedMessage({ id: msg.id, text: msg.text })}
              onReply={() => handleReply(msg)}
              onForward={() => setForwardingMsg(msg.text)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="bg-[#181820] px-4 py-2 border-t border-white/[0.08] flex items-center justify-between z-10 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Reply className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="min-w-0 text-xs">
              <span className="text-purple-300 font-semibold block">Replying to {replyingTo.senderName}</span>
              <span className="text-gray-400 truncate block">{replyingTo.text}</span>
            </div>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer / Input Bar */}
      <footer className="bg-[#16161d]/90 backdrop-blur-xl px-3 py-2.5 sm:px-4 sm:py-3 border-t border-white/[0.08] z-10 relative">
        {/* Mention Autocomplete Popup */}
        <GroupTagAutocomplete
          isOpen={mentionQuery !== null && filteredTags.length > 0}
          query={mentionQuery || ""}
          participants={participantsList}
          selectedIndex={mentionSelectedIndex}
          onSelectTag={handleSelectMention}
        />

        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-[#22222d] border border-red-500/30 rounded-2xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-400 font-mono text-sm font-semibold">
                {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-300 font-medium">Recording voice note...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stopRecording(false)}
                className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-white/10 transition-colors"
                title="Cancel recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => stopRecording(true)}
                className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all shadow-md active:scale-95"
                title="Send voice note"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-purple-300 p-2 sm:p-2.5 rounded-2xl hover:bg-white/[0.08] transition-all flex-shrink-0 active:scale-95"
              title="Attach Photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              onClick={handleTriggerMention}
              className="text-gray-400 hover:text-purple-300 p-2 sm:p-2.5 rounded-2xl hover:bg-white/[0.08] transition-all flex-shrink-0 active:scale-95 font-bold font-mono text-base"
              title="Mention member or tag (@all, @online, @anon)"
            >
              <AtSign className="w-5 h-5" />
            </button>
            
            <div className="flex-1 bg-[#1e1e28] rounded-2xl flex items-center px-3.5 py-2 sm:px-4 sm:py-2.5 border border-white/[0.08] focus-within:border-purple-500/60 transition-all shadow-inner">
              <input
                ref={textInputRef}
                type="text"
                placeholder={chatMeta.isGroup ? "Type a message or @ to mention..." : `Encrypted message to ${chatName}...`}
                value={message}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (mentionQuery !== null && filteredTags.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setMentionSelectedIndex((prev) => (prev + 1) % filteredTags.length);
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setMentionSelectedIndex((prev) => (prev - 1 + filteredTags.length) % filteredTags.length);
                      return;
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      if (filteredTags[mentionSelectedIndex]) {
                        e.preventDefault();
                        handleSelectMention(filteredTags[mentionSelectedIndex].tag);
                        return;
                      }
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setMentionQuery(null);
                      return;
                    }
                  }

                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-xs md:text-sm font-normal"
              />
            </div>

            {message.trim() ? (
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-2.5 rounded-2xl transition-all flex-shrink-0 shadow-lg shadow-purple-600/30 active:scale-95"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="text-gray-400 hover:text-purple-300 p-2.5 rounded-2xl hover:bg-white/[0.08] transition-all flex-shrink-0 active:scale-95"
                title="Hold or tap to record voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </footer>

      {/* Forward Modal */}
      {forwardingMsg && (
        <ForwardMessageModal
          isOpen={!!forwardingMsg}
          onClose={() => setForwardingMsg(null)}
          onForward={handleForwardMessage}
        />
      )}

      {/* Wallpaper Modal */}
      <WallpaperModal
        isOpen={showWallpaperModal}
        onClose={() => setShowWallpaperModal(false)}
        currentWallpaper={wallpaper}
        onSelect={(w) => setWallpaper(w)}
        onSelectWallpaper={(w) => setWallpaper(w)}
      />
    </div>
  );
}
