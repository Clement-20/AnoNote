import { useState } from "react";
import { SmilePlus, Share2, Pin } from "lucide-react";

interface MessageBubbleProps {
  text: string;
  isSent: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'file';
  reactions?: { [emoji: string]: string[] | number };
  onReact?: (emoji: string) => void;
  onForward?: () => void;
  onPin?: () => void;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function MessageBubble({
  text,
  isSent,
  timestamp,
  status = 'read',
  mediaUrl,
  mediaType = 'image',
  reactions = {},
  onReact,
  onForward,
  onPin,
}: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} group relative`}>
      <div className="max-w-[70%] relative">
        {/* Quick reaction, forward & pin button on hover / trigger */}
        <div
          className={`absolute top-0 ${
            isSent ? "-left-28" : "-right-28"
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
            onClick={onForward}
            className="text-gray-400 hover:text-purple-400 transition-colors p-0.5 ml-0.5 border-l border-gray-700 pl-1"
            title="Forward message"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onPin}
            className="text-gray-400 hover:text-purple-400 transition-colors p-0.5 ml-0.5 border-l border-gray-700 pl-1"
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

        <div
          className={`rounded-2xl px-4 py-2 ${
            isSent
              ? "bg-purple-600 text-white rounded-br-sm"
              : "bg-[#1c1c1e] text-white rounded-bl-sm"
          }`}
        >
          {mediaUrl && mediaType === 'audio' ? (
            <div className="mb-2 w-64 max-w-full">
              <audio controls src={mediaUrl} className="w-full h-10 accent-purple-500" />
            </div>
          ) : mediaUrl ? (
            <div className="mb-2 rounded-xl overflow-hidden border border-black/20 max-w-xs">
              <img src={mediaUrl} alt="Attached media" className="w-full h-auto object-cover max-h-60" />
            </div>
          ) : null}
          <p className="text-sm leading-relaxed">{text}</p>
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
