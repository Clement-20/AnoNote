import { useState, useRef } from "react";
import { SmilePlus, Share2, Pin, Reply, Clock, CheckCheck, Check, X, Pencil, Trash2 } from "lucide-react";
import { formatMessageWithTags } from "../utils/tagFormatter";

interface MessageBubbleProps {
  id: string;
  text: string;
  isSent: boolean;
  senderAnonId?: string;
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
  onEdit?: () => void;
  onDelete?: () => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function MessageBubble({
  id,
  text,
  isSent: isSentProp,
  senderAnonId,
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
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const isSent = isSentProp || (!!senderAnonId && !!currentUserAnonId && senderAnonId === currentUserAnonId);
  const [showPicker, setShowPicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Long press mobile menu state
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const touchTimeoutRef = useRef<any>(null);

  // Swipe to reply state
  const [swipeTranslation, setSwipeTranslation] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // 1. Long press trigger setup
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => {
      setShowMobileOptions(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(55);
      }
    }, 550);

    // 2. Swipe start setup
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartXRef.current;

    // If moved significantly, cancel long press
    if (Math.abs(diffX) > 10) {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    }

    // Swiping right (diffX > 0)
    if (diffX > 0) {
      isSwipingRef.current = true;
      const translation = Math.min(diffX, 65);
      setSwipeTranslation(translation);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    if (isSwipingRef.current && swipeTranslation >= 45) {
      if (onReply) {
        onReply();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    }

    setSwipeTranslation(0);
    touchStartXRef.current = null;
    isSwipingRef.current = false;
  };

  return (
    <>
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
          {isSent && !isPending && (
            <>
              <div className="w-[1px] h-3.5 bg-[#2a3942] mx-0.5" />
              <button
                onClick={onEdit}
                className="text-[#8696a0] hover:text-amber-400 p-1 rounded-full hover:bg-[#111b21]"
                title="Edit message"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="text-[#8696a0] hover:text-red-400 p-1 rounded-full hover:bg-[#111b21]"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
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

        {/* Swipe Reply indicator */}
        {swipeTranslation > 10 && (
          <div
            className="absolute left-[-35px] top-1/2 -translate-y-1/2 bg-[#0084ff]/25 text-[#38bdf8] p-1.5 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-100 z-10"
            style={{ opacity: Math.min(swipeTranslation / 45, 1) }}
          >
            <Reply className="w-3.5 h-3.5" />
          </div>
        )}

        {/* AnoNote Message Bubble Body */}
        <div
          onDoubleClick={onReply}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translate3d(${swipeTranslation}px, 0px, 0px)`,
            transition: swipeTranslation === 0 ? "transform 0.2s cubic-bezier(0.1, 0.8, 0.25, 1)" : "none"
          }}
          className={`relative px-3 pt-2 pb-1.5 select-text rounded-2xl cursor-pointer ${
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

    {/* Mobile Long Press Modal Overlay */}
    {showMobileOptions && (
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex flex-col justify-end p-4 animate-in fade-in duration-150"
        onClick={() => setShowMobileOptions(false)}
      >
        <div
          className="w-full max-w-sm mx-auto bg-[#1f2c34] rounded-2xl p-4 space-y-4 shadow-2xl border border-[#2a3942] animate-in slide-in-from-bottom duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Reactions Header */}
          <div>
            <p className="text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider mb-2 px-1">Quick Reaction</p>
            <div className="flex items-center justify-between bg-[#111b21] rounded-xl p-2">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact?.(emoji);
                    setShowMobileOptions(false);
                  }}
                  className="hover:scale-125 transition-transform text-2xl p-1.5 active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Menu options list */}
          <div className="divide-y divide-[#2a3942]/50 bg-[#111b21] rounded-xl overflow-hidden text-sm">
            <button
              onClick={() => {
                onReply?.();
                setShowMobileOptions(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-[#e9edef] hover:bg-[#202c33]/40 active:bg-[#202c33] transition-colors"
            >
              <Reply className="w-4 h-4 text-[#38bdf8]" />
              <span>Reply</span>
            </button>

            <button
              onClick={() => {
                onForward?.();
                setShowMobileOptions(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-[#e9edef] hover:bg-[#202c33]/40 active:bg-[#202c33] transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#38bdf8]" />
              <span>Forward Message</span>
            </button>

            <button
              onClick={() => {
                onPin?.();
                setShowMobileOptions(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-[#e9edef] hover:bg-[#202c33]/40 active:bg-[#202c33] transition-colors"
            >
              <Pin className="w-4 h-4 text-[#38bdf8]" />
              <span>Pin Message</span>
            </button>

            {isSent && !isPending && (
              <>
                <button
                  onClick={() => {
                    onEdit?.();
                    setShowMobileOptions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-amber-400 hover:bg-[#202c33]/40 active:bg-[#202c33] transition-colors font-medium"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Message</span>
                </button>

                <button
                  onClick={() => {
                    onDelete?.();
                    setShowMobileOptions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-red-400 hover:bg-[#202c33]/40 active:bg-[#202c33] transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Message</span>
                </button>
              </>
            )}
          </div>

          {/* Cancel Button */}
          <button
            onClick={() => setShowMobileOptions(false)}
            className="w-full bg-[#202c33] hover:bg-[#2a3942] active:bg-[#202c33] text-[#e9edef] text-xs font-semibold py-3 rounded-xl transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </>
  );
}
