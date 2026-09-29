import { useState } from "react";
import { SmilePlus, Share2, Pin, Reply } from "lucide-react";
import { formatMessageWithTags } from "../utils/tagFormatter";

interface GroupMessageBubbleProps {
  text: string;
  senderName: string;
  senderAvatar: string;
  isSent: boolean;
  timestamp: string;
  currentUserAnonId?: string;
  status?: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'file';
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

export function GroupMessageBubble({
  text,
  senderName,
  senderAvatar,
  isSent,
  timestamp,
  currentUserAnonId,
  status = 'read',
  mediaUrl,
  mediaType = 'image',
  reactions = {},
  replyTo,
  onReact,
  onForward,
  onPin,
  onReply,
}: GroupMessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className={`flex gap-2 ${isSent ? "flex-row-reverse" : "flex-row"} group relative`}>
      {/* Avatar - only show for received messages */}
      {!isSent && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-lg flex-shrink-0">
          {senderAvatar}
        </div>
      )}

      <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[70%] relative`}>
        {/* Quick action toolbar on hover */}
        <div
          className={`absolute top-0 ${
            isSent ? "-left-36" : "-right-36"
          } hidden group-hover:flex items-center gap-1 bg-[#1c1c1e] border border-gray-800 rounded-full px-2 py-1 shadow-lg z-10`}
        >
          {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact?.(emoji)}
              className="hover:scale-125 transition-transform text-sm p-0.5"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-gray-400 hover:text-white transition-colors p-0.5"
            title="More reactions"
          >
            <SmilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={onReply}
            className="text-gray-400 hover:text-purple-400 transition-colors p-0.5 ml-0.5 border-l border-gray-700 pl-1"
            title="Reply to message"
          >
            <Reply className="w-4 h-4" />
          </button>
          <button
            onClick={onForward}
            className="text-gray-400 hover:text-purple-400 transition-colors p-0.5"
            title="Forward message"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onPin}
            className="text-gray-400 hover:text-purple-400 transition-colors p-0.5"
            title="Pin message"
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>

        {/* Full picker popover */}
        {showPicker && (
          <div
            className={`absolute top-[-44px] ${
              isSent ? "right-0" : "left-0"
            } bg-[#1c1c1e] border border-gray-800 rounded-full px-3 py-1.5 shadow-xl flex items-center gap-2 z-20`}
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

        {/* Sender name - only show for received messages */}
        {!isSent && (
          <span className="text-xs text-purple-400 font-medium mb-1 px-1">
            {senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          onDoubleClick={onReply}
          className={`rounded-2xl px-4 py-2 select-text ${
            isSent
              ? "bg-purple-600 text-white rounded-br-sm"
              : "bg-[#2c2c2e] text-white rounded-bl-sm"
          }`}
        >
          {/* Quoted preview if this message is a reply */}
          {replyTo && (
            <div
              className={`mb-2 px-3 py-1.5 rounded-lg border-l-4 border-purple-300 ${
                isSent ? "bg-black/25 text-purple-100" : "bg-black/40 text-purple-200"
              } text-xs flex flex-col`}
            >
              <div className="flex items-center gap-1 font-semibold text-[11px] text-purple-200 mb-0.5">
                <Reply className="w-3 h-3" />
                <span>{replyTo.senderName || "Original message"}</span>
              </div>
              <p className="truncate text-gray-200/90 text-xs italic">
                {replyTo.text}
              </p>
            </div>
          )}

          {mediaUrl && mediaType === 'audio' ? (
            <div className="mb-2 w-64 max-w-full">
              <audio controls src={mediaUrl} className="w-full h-10 accent-purple-500" />
            </div>
          ) : mediaUrl ? (
            <div className="mb-2 rounded-xl overflow-hidden border border-black/20 max-w-xs">
              <img src={mediaUrl} alt="Attached media" className="w-full h-auto object-cover max-h-60" />
            </div>
          ) : null}
          <p className="text-sm md:text-base break-words">
            {formatMessageWithTags(text, currentUserAnonId, undefined, isSent)}
          </p>
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
                  className="bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-gray-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-gray-300 transition-colors shadow-xs"
                >
                  <span>{emoji}</span>
                  <span className="font-medium text-purple-400">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs text-gray-500 mt-1 px-1 flex items-center gap-1 ${
            isSent ? "justify-end" : "justify-start"
          }`}
        >
          <span>{timestamp}</span>
          {isSent && (
            <span
              className={`font-bold text-xs tracking-tighter ${
                status === 'read' ? 'text-sky-400' : 'text-gray-400'
              }`}
              title={status === 'read' ? 'Read' : 'Delivered'}
            >
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
