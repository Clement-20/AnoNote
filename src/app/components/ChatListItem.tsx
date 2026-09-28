import { VerifiedBadge } from "./VerifiedBadge";

interface ChatListItemProps {
  id?: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  isVerified?: boolean;
  draft?: string;
  isActive?: boolean;
}

export function ChatListItem({
  name,
  lastMessage,
  timestamp,
  unread,
  avatar,
  isVerified = false,
  draft,
  isActive = false,
}: ChatListItemProps) {
  return (
    <div
      className={`group relative flex items-center gap-3.5 px-3.5 py-3 mx-2 my-1 rounded-2xl transition-all duration-150 cursor-pointer ${
        isActive
          ? "bg-purple-600/15 border border-purple-500/30 text-white shadow-sm"
          : "hover:bg-white/[0.05] border border-transparent text-gray-300"
      }`}
    >
      {/* Left accent indicator for active chat */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-r-full shadow-sm shadow-purple-500/50" />
      )}

      {/* Avatar Container */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2a2a35] to-[#1c1c24] border border-white/10 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform duration-200">
          {avatar}
        </div>
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 bg-[#121214] rounded-full p-0.5 shadow-sm">
            <VerifiedBadge size="xs" userName={name} interactive={false} />
          </div>
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className={`font-semibold text-sm truncate ${isActive ? "text-white font-bold" : "text-gray-100 group-hover:text-purple-300 transition-colors"}`}>
              {name}
            </h3>
            {isVerified && <VerifiedBadge size="sm" userName={name} />}
          </div>
          <span className="text-[11px] font-mono text-gray-400 tabular-nums flex-shrink-0 ml-2">
            {timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          {draft ? (
            <p className="text-xs truncate flex items-center gap-1">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">Draft:</span>
              <span className="text-gray-300 italic">{draft}</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400/90 truncate group-hover:text-gray-300 transition-colors">
              {lastMessage}
            </p>
          )}

          {unread > 0 && (
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10.5px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-600/30 animate-in zoom-in-50">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
