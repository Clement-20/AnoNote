import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  MoreVertical,
  Send,
  Paperclip,
  Phone,
  Video,
  Smile,
  Mic,
  Trash2,
  Pin,
  X,
  Reply,
  WifiOff,
  Camera,
  AtSign,
  Lock,
  ChevronDown,
} from "lucide-react";
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
  editMessage,
  deleteMessage,
  toggleMessageReaction,
  ensureChatParticipant,
  subscribeToChatDraft,
  saveChatDraft,
  deleteChatDraft,
  subscribeToQueueCount,
  subscribeToUserPresence,
  markMessagesAsRead,
  markMessagesAsDelivered,
  UserPresence,
  FirestoreMessage,
} from "../services/chatService";

export function ChatViewDesktop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    const unsubQueue = subscribeToQueueCount((count) => {
      setQueuedCount(count);
    });
    return () => unsubQueue();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);
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
    return localStorage.getItem(`anonote_wallpaper_${currentChatId}`) || "bg-[#0b141a]";
  });

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionCursorPos, setMentionCursorPos] = useState<number>(0);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState<number>(0);

  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [forwardingMsg, setForwardingMsg] = useState<string | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<{ id: string; text: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageOriginalText, setEditingMessageOriginalText] = useState<string>("");
  const textInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialScrollDoneRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const prevChatIdRef = useRef(currentChatId);
  const prevMessagesCountRef = useRef(0);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

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

  // Auto-save draft
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
    ensureChatParticipant(currentChatId, currentUser);
    const unsubscribe = subscribeToMessages(currentChatId, (msgs) => {
      setFirestoreMessages(msgs);
    });
    return () => unsubscribe();
  }, [currentChatId, currentUser]);

  const [liveChatDoc, setLiveChatDoc] = useState<any>(null);

  useEffect(() => {
    const unsub = subscribeToChatMetadata(currentChatId, (docData) => {
      setLiveChatDoc(docData);
    });
    return () => unsub();
  }, [currentChatId]);

  const [peerPresence, setPeerPresence] = useState<UserPresence | null>(null);

  // Dynamic peer/group metadata lookup
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

    if (currentChatId.startsWith("chat_")) {
      const parts = currentChatId.replace("chat_", "").split("__");
      const myClean = currentUser.anonId.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const peerClean = parts.find((p) => p !== myClean) || parts[0];
      const otherParticipant = liveChatDoc?.participants?.find((p: string) => p !== currentUser.anonId);
      const peerData = otherParticipant && liveChatDoc?.participantData?.[otherParticipant];
      const displayName = peerPresence?.name || peerData?.name || `Anon #${peerClean.replace(/[^0-9]/g, "") || peerClean}`;
      return {
        name: displayName,
        avatar: peerPresence?.avatar || peerData?.avatar || "👤",
        isVerified: peerPresence?.isVerified !== undefined ? !!peerPresence.isVerified : !!peerData?.isVerified,
        isGroup: false,
      };
    }

    return {
      name: "Encrypted Chat",
      avatar: "👤",
      isVerified: false,
      isGroup: false,
    };
  })();

  const chatName = chatMeta.name;
  const chatAvatar = chatMeta.avatar;
  const isVerified = chatMeta.isVerified;

  const peerAnonId = (() => {
    if (chatMeta.isGroup) return null;
    const otherInDoc = liveChatDoc?.participants?.find((p: string) => p !== currentUser.anonId);
    if (otherInDoc) return otherInDoc;
    if (currentChatId.startsWith("chat_")) {
      const parts = currentChatId.replace("chat_", "").split("__");
      const myClean = currentUser.anonId.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const peerClean = parts.find((p) => p !== myClean) || parts[0];
      return `Anon #${peerClean.replace(/[^0-9]/g, "") || peerClean}`;
    }
    return null;
  })();

  // Subscribe and load user presence for this peer

  useEffect(() => {
    if (!peerAnonId) {
      setPeerPresence(null);
      return;
    }
    const unsub = subscribeToUserPresence(peerAnonId, (presence) => {
      setPeerPresence(presence);
    });
    return () => unsub();
  }, [peerAnonId]);

  const peerStatus = (() => {
    if (chatMeta.isGroup) {
      return {
        text: `${chatMeta.participantsCount} members`,
        isOnline: false,
      };
    }

    if (peerPresence?.isOnline) {
      return {
        text: "online",
        isOnline: true,
      };
    }

    if (peerPresence?.lastSeen) {
      try {
        const d = new Date(peerPresence.lastSeen);
        if (!isNaN(d.getTime())) {
          const now = new Date();
          const isToday =
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const isYesterday =
            d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear();

          const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

          if (isToday) {
            return {
              text: `last seen today at ${timeStr}`,
              isOnline: false,
            };
          } else if (isYesterday) {
            return {
              text: `last seen yesterday at ${timeStr}`,
              isOnline: false,
            };
          } else {
            const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
            return {
              text: `last seen ${dateStr} at ${timeStr}`,
              isOnline: false,
            };
          }
        }
      } catch {}
    }

    // Check if peer sent any message in chat history
    const peerLastMessage = firestoreMessages
      .filter((m) => m.senderAnonId !== currentUser.anonId)
      .slice(-1)[0];

    if (peerLastMessage?.timestamp) {
      return {
        text: `last seen at ${peerLastMessage.timestamp}`,
        isOnline: false,
      };
    }

    return {
      text: "offline",
      isOnline: false,
    };
  })();

  // Autocomplete participants list
  const participantsList: TagCandidate[] = [
    { anonId: "all", name: "all", avatar: "👥" },
    { anonId: "online", name: "online", avatar: "🟢" },
  ];

  if (liveChatDoc?.participants && Array.isArray(liveChatDoc.participants)) {
    liveChatDoc.participants.forEach((pId: string) => {
      const pData = liveChatDoc.participantData?.[pId];
      participantsList.push({
        anonId: pId,
        name: pData?.name || pId,
        avatar: pData?.avatar || "👤",
      });
    });
  }

  const filteredTags = participantsList.filter((p) => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.anonId.toLowerCase().includes(q);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart || val.length;
    setMessage(val);

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

  // Convert Firestore messages to bubble props
  const messages = firestoreMessages.map((m) => ({
    id: m.id,
    text: m.text,
    isSent: m.senderAnonId === currentUser.anonId,
    timestamp: m.timestamp || new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: m.status,
    isPending: m.isPending,
    mediaUrl: m.mediaUrl,
    mediaType: m.mediaType,
    senderName: m.senderName || m.senderAnonId,
    reactions: m.reactions || {},
  }));

  // Reset initial scroll flag when navigating between different chats
  useEffect(() => {
    if (prevChatIdRef.current !== currentChatId) {
      prevChatIdRef.current = currentChatId;
      isInitialScrollDoneRef.current = false;
      isNearBottomRef.current = true;
      setShowScrollBottomBtn(false);
      prevMessagesCountRef.current = 0;
    }
  }, [currentChatId]);

  // Jump to latest messages immediately upon entering, and only scroll down on new messages if user is already at the bottom
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (!isInitialScrollDoneRef.current && messages.length > 0) {
      // 1. Immediately anchor to the bottom showing latest chats without any downward scroll animation
      container.scrollTop = container.scrollHeight;
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
      isInitialScrollDoneRef.current = true;
      prevMessagesCountRef.current = messages.length;
      return;
    }

    // 2. When a new message is added while already inside the chat
    if (messages.length > prevMessagesCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      const isSentByMe = lastMsg?.isSent;

      // Only auto-scroll down if user sent the message or was already reading at the bottom
      // If user has scrolled up to read older messages, DO NOT interrupt them!
      if (isSentByMe || isNearBottomRef.current) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages.length, currentChatId]);

  // Detect whether user is reading older messages
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distanceFromBottom < 100;
    isNearBottomRef.current = isAtBottom;
    setShowScrollBottomBtn(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleReact = async (msgId: string, emoji: string) => {
    await toggleMessageReaction(currentChatId, msgId, emoji, currentUser.anonId);
  };

  const handleReply = (msg: any) => {
    setReplyingTo({
      id: msg.id,
      text: msg.text,
      senderName: msg.isSent ? "You" : msg.senderName,
    });
    textInputRef.current?.focus();
  };

  const handleEditMessage = (msgId: string, originalText: string) => {
    setEditingMessageId(msgId);
    setEditingMessageOriginalText(originalText);
    setMessage(originalText.replace(" (edited)", ""));
    textInputRef.current?.focus();
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (window.confirm("Are you sure you want to delete this message permanently? This action is zero-knowledge and cannot be undone.")) {
      await deleteMessage(currentChatId, msgId);
    }
  };

  // Read and Delivery Receipt tracking
  const processedReadIdsRef = useRef<Set<string>>(new Set());
  const processedDeliveredIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    processedReadIdsRef.current.clear();
    processedDeliveredIdsRef.current.clear();
  }, [currentChatId]);

  useEffect(() => {
    if (!firestoreMessages || firestoreMessages.length === 0) return;

    // 1. Mark incoming unread messages as READ if chat is currently open and visible
    const incomingUnread = firestoreMessages.filter(
      (m) => m.senderAnonId !== currentUser.anonId && m.status !== "read" && !processedReadIdsRef.current.has(m.id)
    );

    if (incomingUnread.length > 0) {
      const idsToMarkRead = incomingUnread.map((m) => m.id);
      idsToMarkRead.forEach((id) => processedReadIdsRef.current.add(id));

      if (typeof document === "undefined" || document.visibilityState === "visible") {
        markMessagesAsRead(currentChatId, idsToMarkRead, currentUser.anonId);
      } else {
        markMessagesAsDelivered(currentChatId, idsToMarkRead);
      }
    }

    // 2. Mark any incoming messages with status 'sent' as DELIVERED because recipient is online in this chat
    const incomingSent = firestoreMessages.filter(
      (m) => m.senderAnonId !== currentUser.anonId && m.status === "sent" && !processedDeliveredIdsRef.current.has(m.id)
    );
    if (incomingSent.length > 0) {
      const idsToMarkDelivered = incomingSent.map((m) => m.id);
      idsToMarkDelivered.forEach((id) => processedDeliveredIdsRef.current.add(id));
      markMessagesAsDelivered(currentChatId, idsToMarkDelivered);
    }
  }, [firestoreMessages, currentChatId, currentUser.anonId]);

  // When user returns to tab while viewing this chat, mark any unread messages as read
  useEffect(() => {
    const handleTabVisible = () => {
      if (document.visibilityState === "visible" && firestoreMessages.length > 0) {
        const unread = firestoreMessages.filter(
          (m) => m.senderAnonId !== currentUser.anonId && m.status !== "read"
        );
        if (unread.length > 0) {
          const ids = unread.map((m) => m.id);
          markMessagesAsRead(currentChatId, ids, currentUser.anonId);
        }
      }
    };
    document.addEventListener("visibilitychange", handleTabVisible);
    return () => document.removeEventListener("visibilitychange", handleTabVisible);
  }, [firestoreMessages, currentChatId, currentUser.anonId]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const textToSend = message.trim();
    setMessage("");
    setReplyingTo(null);
    setMentionQuery(null);
    deleteChatDraft(currentUser.anonId, currentChatId);

    if (editingMessageId) {
      try {
        await editMessage(currentChatId, editingMessageId, textToSend);
        setEditingMessageId(null);
        setEditingMessageOriginalText("");
      } catch (e) {
        console.error("Failed to edit message:", e);
      }
      return;
    }

    try {
      const isPeerOnline = chatMeta.isGroup ? false : !!peerPresence?.isOnline;
      await sendChatMessage(currentChatId, currentUser, textToSend, undefined, undefined, isPeerOnline);
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Audio recording error:", err);
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (!mediaRecorderRef.current) return;

    clearInterval(timerRef.current);
    mediaRecorderRef.current.onstop = async () => {
      if (shouldSend && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          await sendChatMessage(currentChatId, currentUser, "[Voice Note 🎙️]", "audio", base64data);
        };
        reader.readAsDataURL(audioBlob);
      }
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingSeconds(0);
    };

    mediaRecorderRef.current.stop();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;
      await sendChatMessage(currentChatId, currentUser, file.name, "image", base64Url);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleClearChat = () => {
    setFirestoreMessages([]);
    setShowMenu(false);
  };

  const handleForwardMessage = async (targetChatId: string) => {
    if (!forwardingMsg) return;
    await sendChatMessage(targetChatId, currentUser, forwardingMsg);
    setForwardingMsg(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* AnoNote Chat View Header */}
      <header className="bg-[#111b21] px-3 py-2 border-b border-[#202c33] flex items-center justify-between z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="text-[#aebac1] hover:text-[#e9edef] p-1.5 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Link
            to={chatMeta.isGroup ? `/group/${currentChatId}/info` : `/chat/${currentChatId}/info`}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
              {chatAvatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[#e9edef] font-medium text-[15px] truncate leading-tight">
                  {chatName}
                </h2>
                {isVerified && <VerifiedBadge size="xs" userName={chatName} />}
              </div>
              <p
                className={`text-[12px] truncate leading-tight transition-colors flex items-center gap-1.5 ${
                  peerStatus.isOnline
                    ? "text-[#00a8fc] font-medium"
                    : "text-[#8696a0]"
                }`}
              >
                {peerStatus.isOnline && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00a8fc] inline-block animate-pulse" />
                )}
                <span>{peerStatus.text}</span>
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1 text-[#aebac1]">
          <button
            onClick={() => navigate(`/call/${currentChatId}?video=true`)}
            className="p-2 hover:bg-[#202c33] rounded-full text-[#aebac1] hover:text-[#e9edef] transition-colors"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(`/call/${currentChatId}`)}
            className="p-2 hover:bg-[#202c33] rounded-full text-[#aebac1] hover:text-[#e9edef] transition-colors"
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#202c33] rounded-full text-[#aebac1] hover:text-[#e9edef] transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
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

      {/* Offline Alert */}
      {!isNetworkOnline && (
        <div className="bg-[#182229] border-b border-[#202c33] px-4 py-1.5 flex items-center justify-between text-xs text-[#8696a0] z-10">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-[#f15c6d] flex-shrink-0" />
            <span>Waiting for network. Messages will send automatically when online.</span>
          </div>
        </div>
      )}

      {/* Pinned Message */}
      {pinnedMessage && (
        <div className="bg-[#111b21] border-b border-[#202c33] px-4 py-1.5 flex items-center justify-between text-xs text-[#8696a0] z-10">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-[#0084ff] flex-shrink-0" />
            <span className="text-[#e9edef] truncate">{pinnedMessage.text}</span>
          </div>
          <button onClick={() => setPinnedMessage(null)} className="text-[#8696a0] hover:text-[#e9edef] p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-1 bg-[#0b141a] relative"
      >
        {/* Centered Encryption Banner */}
        <div className="flex justify-center my-3">
          <div className="bg-[#112438] border border-[#1e3a5f] rounded-lg px-3 py-1.5 max-w-sm text-center text-[12px] text-[#93c5fd] flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#38bdf8]" />
            <span>Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
          </div>
        </div>

        {/* Date pill */}
        <div className="flex justify-center my-2">
          <span className="bg-[#182229] text-[#8696a0] text-[11px] font-medium px-3 py-1 rounded-md shadow-xs select-none">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            {...msg}
            currentUserAnonId={currentUser.anonId}
            onReact={(emoji) => handleReact(msg.id, emoji)}
            onPin={() => setPinnedMessage({ id: msg.id, text: msg.text })}
            onReply={() => handleReply(msg)}
            onForward={() => setForwardingMsg(msg.text)}
            onEdit={() => handleEditMessage(msg.id, msg.text)}
            onDelete={() => handleDeleteMessage(msg.id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button (WhatsApp style) */}
      {showScrollBottomBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 z-30 w-10 h-10 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef] shadow-2xl border border-[#2e3b44] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 animate-in fade-in"
          title="Scroll to latest messages"
        >
          <ChevronDown className="w-5 h-5 text-[#00a8fc]" />
        </button>
      )}

      {/* Editing Message Banner */}
      {editingMessageId && (
        <div className="bg-[#111b21] px-4 py-2 border-t border-[#202c33] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 min-w-0 border-l-4 border-amber-500 pl-2.5">
            <div className="min-w-0 text-xs">
              <span className="text-amber-500 font-medium block">Editing Message</span>
              <span className="text-[#8696a0] truncate block">{editingMessageOriginalText}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingMessageId(null);
              setEditingMessageOriginalText("");
              setMessage("");
            }}
            className="text-[#8696a0] hover:text-[#e9edef] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reply Banner */}
      {replyingTo && (
        <div className="bg-[#111b21] px-4 py-2 border-t border-[#202c33] flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5 min-w-0 border-l-4 border-[#0084ff] pl-2.5">
            <div className="min-w-0 text-xs">
              <span className="text-[#38bdf8] font-medium block">{replyingTo.senderName}</span>
              <span className="text-[#8696a0] truncate block">{replyingTo.text}</span>
            </div>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-[#8696a0] hover:text-[#e9edef] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clean Bottom Input Bar */}
      <footer className="bg-[#111b21] px-2 py-2 sm:px-3 border-t border-[#202c33] z-10 relative">
        <GroupTagAutocomplete
          isOpen={mentionQuery !== null && filteredTags.length > 0}
          query={mentionQuery || ""}
          participants={participantsList}
          selectedIndex={mentionSelectedIndex}
          onSelectTag={handleSelectMention}
        />

        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-[#202c33] rounded-full px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f15c6d] animate-ping" />
              <span className="text-[#f15c6d] font-mono text-sm font-semibold">
                {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-[#8696a0]">Recording audio...</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => stopRecording(false)} className="p-2 text-[#8696a0] hover:text-[#f15c6d]">
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => stopRecording(true)}
                className="p-2 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-full"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Left Pill Container with emoji, input, attachment, and camera */}
            <div className="flex-1 bg-[#202c33] rounded-full flex items-center px-3 py-1.5 text-[#8696a0]">
              <button
                onClick={handleTriggerMention}
                className="p-1 hover:text-[#e9edef] transition-colors"
                title="Emoji & Mention"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                ref={textInputRef}
                type="text"
                placeholder="Message"
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
                className="bg-transparent text-[#e9edef] placeholder-[#8696a0] outline-none flex-1 text-[15px] px-2.5 py-0.5"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:text-[#e9edef] transition-colors"
                title="Attach document or photo"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:text-[#e9edef] transition-colors ml-1"
                title="Camera"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            {/* Right Blue Circular Action Button */}
            {message.trim() ? (
              <button
                onClick={handleSend}
                className="w-11 h-11 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
                title="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-11 h-11 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
                title="Voice note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </footer>

      {forwardingMsg && (
        <ForwardMessageModal
          isOpen={!!forwardingMsg}
          onClose={() => setForwardingMsg(null)}
          onForward={handleForwardMessage}
        />
      )}

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
