import { useState } from "react";
import { SmilePlus, Share2, Pin, Reply, Clock, CheckCheck, Check, X } from "lucide-react";
import { formatMessageWithTags } from "../utils/tagFormatter";

interface MessageBubbleProps {
  text: string;
  isSent: boolean;
  timestamp: string;
  senderName?: string;
  currentUserAnonId?: string;
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

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function MessageBubble({
  text,
  isSent,
  timestamp,
  senderName,
  currentUserAnonId,
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
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} group relative mb-1.5`}>
      <div className="max-w-[85%] sm:max-w-[70%] relative">
        {/* Quick action toolbar on hover */}
        <div
          className={`absolute -top-8 ${
            isSent ? "right-0" : "left-0"
          } hidden group-hover:flex items-center gap-1 bg-[#202c33] border border-[#2a3942] rounded-full px-2 py-1 shadow-md z-20`}
        >
          {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact?.(emoji)}
              className="hover:scale-125 transition-transform text-sm p-1 rounded-full hover:bg-[#111b21]"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-[#8696a0] hover:text-[#e9edef] p-1 rounded-full hover:bg-[#111b21]"
            title="More reactions"
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-[#2a3942] mx-0.5" />
          <button
            onClick={onReply}
            className="text-[#8696a0] hover:text-[#38bdf8] p-1 rounded-full hover:bg-[#111b21]"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onForward}
            className="text-[#8696a0] hover:text-[#38bdf8] p-1 rounded-full hover:bg-[#111b21]"
            title="Forward"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onPin}
            className="text-[#8696a0] hover:text-[#38bdf8] p-1 rounded-full hover:bg-[#111b21]"
            title="Pin"
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reaction picker */}
        {showPicker && (
          <div
            className={`absolute -top-10 ${
              isSent ? "right-0" : "left-0"
            } bg-[#202c33] border border-[#2a3942] rounded-full px-3 py-1 shadow-lg flex items-center gap-1.5 z-30`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact?.(emoji);
                  setShowPicker(false);
                }}
                className="hover:scale-125 transition-transform text-base p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* AnoNote Message Bubble Body */}
        <div
          onDoubleClick={onReply}
          className={`relative px-3 pt-2 pb-1.5 select-text rounded-2xl ${
            isSent
              ? "bg-[#0b4d75] text-[#f0f9ff] rounded-tr-xs"
              : "bg-[#202c33] text-[#e9edef] rounded-tl-xs"
          }`}
        >
          {/* Group Sender Name */}
          {!isSent && senderName && (
            <p className="text-[12px] font-semibold text-[#38bdf8] mb-1 leading-tight">
              {senderName}
            </p>
          )}

          {/* Quoted Reply inside Bubble */}
          {replyTo && (
            <div
              className={`mb-1.5 px-2.5 py-1.5 rounded-lg border-l-4 ${
                isSent
                  ? "bg-[#073854] border-[#38bdf8] text-[#e0f2fe]"
                  : "bg-[#111b21] border-[#0084ff] text-[#d1d7db]"
              } text-xs flex flex-col`}
            >
              <span className="font-semibold text-[11px] text-[#38bdf8] mb-0.5">
                {replyTo.senderName || "Original message"}
              </span>
              <p className="truncate opacity-80 text-xs">{replyTo.text}</p>
            </div>
          )}

          {/* Media Rendering */}
          {mediaUrl && mediaType === "audio" ? (
            <div className="my-1 w-60 max-w-full">
              <audio controls src={mediaUrl} className="w-full h-8 rounded-lg" />
            </div>
          ) : mediaUrl ? (
            <div className="my-1 rounded-lg overflow-hidden relative group/media cursor-pointer max-w-sm">
              <img
                src={mediaUrl}
                alt="Attached media"
                onClick={() => setShowImageModal(true)}
                className="w-full h-auto object-cover max-h-64 hover:opacity-95 transition-opacity"
              />
            </div>
          ) : null}

          {/* Message Text with inline timestamp */}
          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-0.5">
            <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap break-words flex-1">
              {formatMessageWithTags(text, currentUserAnonId, undefined, isSent)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-[#93c5fd]/70 select-none ml-auto self-end pt-1">
              <span className="tabular-nums text-[10.5px]">{timestamp}</span>
              {isSent && (
                isPending ? (
                  <Clock className="w-3 h-3 text-[#8696a0] animate-pulse" title="Sending..." />
                ) : status === "read" ? (
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" title="Read" />
                ) : status === "delivered" ? (
                  <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" title="Delivered (recipient online)" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-[#8696a0]" title="Sent (recipient offline)" />
                )
              )}
            </div>
          </div>
        </div>

        {/* Reaction badge pill under bubble */}
        {reactions && Object.keys(reactions).length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-0.5 px-1 ${
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
                  className="bg-[#1f2c34] hover:bg-[#2a3942] border border-[#2a3942] text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[#e9edef] transition-colors"
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="text-[10px] text-[#8696a0] font-medium">{count}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for full image viewing */}
      {showImageModal && mediaUrl && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in"
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#202c33] text-white hover:bg-[#111b21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={mediaUrl}
            alt="Full size attachment"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
