import { useState } from "react";
import { SmilePlus, Share2, Pin, Reply, Clock, CheckCheck, Check, Maximize2, X } from "lucide-react";

interface MessageBubbleProps {
  text: string;
  isSent: boolean;
  timestamp: string;
  status?: "sent" | "delivered" | "read" | "pending";
  isPending?: boolean;
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "file";
  reactions?: { [emoji: string]: string[] | number };
  replyTo?: {
    id?: string;
    text: string;
    senderName?: string;
  };
  onReact?: (emoji: string) => void;
  onForward?: () => void;
  onPin?: () => void;
  onReply?: () => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "🔥", "😂", "😮", "🙏"];

export function MessageBubble({
  text,
  isSent,
  timestamp,
  status = "delivered",
  isPending = false,
  mediaUrl,
  mediaType = "image",
  reactions = {},
  replyTo,
  onReact,
  onForward,
  onPin,
  onReply,
}: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} group relative mb-2.5 transition-all duration-200`}>
      <div className="max-w-[78%] sm:max-w-[70%] relative">
        {/* Quick action toolbar on hover */}
        <div
          className={`absolute -top-7 ${
            isSent ? "right-0" : "left-0"
          } hidden group-hover:flex items-center gap-1 bg-[#18181b]/95 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-xl z-20 animate-in fade-in duration-150`}
        >
          {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact?.(emoji)}
              className="hover:scale-130 active:scale-95 transition-transform text-sm p-1 rounded-full hover:bg-white/10"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            title="More reactions"
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />
          <button
            onClick={onReply}
            className="text-gray-400 hover:text-purple-400 transition-colors p-1 rounded-full hover:bg-white/10"
            title="Reply to message"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onForward}
            className="text-gray-400 hover:text-purple-400 transition-colors p-1 rounded-full hover:bg-white/10"
            title="Forward message"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPin}
            className="text-gray-400 hover:text-purple-400 transition-colors p-1 rounded-full hover:bg-white/10"
            title="Pin message"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Full picker popover */}
        {showPicker && (
          <div
            className={`absolute -top-11 ${
              isSent ? "right-0" : "left-0"
            } bg-[#18181b] border border-purple-500/30 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-1.5 z-30 animate-in zoom-in-95`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact?.(emoji);
                  setShowPicker(false);
                }}
                className="hover:scale-130 active:scale-90 transition-transform text-base p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Message Bubble Card */}
        <div
          onDoubleClick={onReply}
          className={`relative px-4 py-2.5 select-text shadow-sm transition-shadow ${
            isSent
              ? "bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-xs border border-purple-400/20 shadow-purple-900/10"
              : "bg-[#1e1e24] text-gray-100 rounded-2xl rounded-bl-xs border border-white/[0.07] shadow-black/20"
          }`}
        >
          {/* Quoted preview if this message is a reply */}
          {replyTo && (
            <div
              className={`mb-2 px-3 py-1.5 rounded-xl border-l-3 ${
                isSent
                  ? "bg-black/20 border-purple-200 text-purple-100"
                  : "bg-black/30 border-purple-400 text-purple-200"
              } text-xs flex flex-col`}
            >
              <div className="flex items-center gap-1 font-semibold text-[11px] opacity-90 mb-0.5">
                <Reply className="w-3 h-3" />
                <span>{replyTo.senderName || "Original message"}</span>
              </div>
              <p className="truncate opacity-80 text-xs italic">
                {replyTo.text}
              </p>
            </div>
          )}

          {/* Media Rendering */}
          {mediaUrl && mediaType === "audio" ? (
            <div className="my-1 w-64 max-w-full">
              <audio controls src={mediaUrl} className="w-full h-9 rounded-lg accent-purple-400" />
            </div>
          ) : mediaUrl ? (
            <div className="my-1.5 rounded-xl overflow-hidden border border-white/10 relative group/media cursor-pointer max-w-sm">
              <img
                src={mediaUrl}
                alt="Attached media"
                onClick={() => setShowImageModal(true)}
                className="w-full h-auto object-cover max-h-64 hover:scale-[1.02] transition-transform duration-200"
              />
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white opacity-0 group-hover/media:opacity-100 transition-opacity"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{text}</p>
        </div>

        {/* Reactions display beneath message */}
        {reactions && Object.keys(reactions).length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1 px-1 ${
              isSent ? "justify-end" : "justify-start"
            }`}
          >
            {Object.entries(reactions).map(([emoji, usersOrCount]) => {
              const count = Array.isArray(usersOrCount)
                ? usersOrCount.length
                : Number(usersOrCount) || 1;
              if (count <= 0) return null;
              return (
                <button
                  key={emoji}
                  onClick={() => onReact?.(emoji)}
                  className="bg-[#1e1e24] hover:bg-[#2a2a32] border border-white/10 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-gray-200 transition-colors shadow-xs"
                >
                  <span>{emoji}</span>
                  <span className="font-semibold text-purple-400 text-[11px]">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Timestamp & Delivery Indicators */}
        <div
          className={`text-[11px] text-gray-400/80 mt-1 px-1 flex items-center gap-1.5 ${
            isSent ? "justify-end" : "justify-start"
          }`}
        >
          <span className="font-mono text-[10.5px]">{timestamp}</span>
          {isSent && (
            isPending ? (
              <span className="flex items-center gap-1 text-amber-400 font-medium" title="Queued locally in Dexie IndexedDB">
                <Clock className="w-3 h-3 animate-pulse" />
                <span className="text-[9.5px]">Queued</span>
              </span>
            ) : status === "read" ? (
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" title="Read" />
            ) : status === "delivered" ? (
              <CheckCheck className="w-3.5 h-3.5 text-gray-400" title="Delivered" />
            ) : (
              <Check className="w-3.5 h-3.5 text-gray-400" title="Sent" />
            )
          )}
        </div>
      </div>

      {/* Image Modal Lightbox */}
      {showImageModal && mediaUrl && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={mediaUrl}
            alt="Full size attachment"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
