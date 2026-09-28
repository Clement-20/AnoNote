import { VerifiedBadge } from "./VerifiedBadge";

interface ChatListItemProps {
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  isVerified?: boolean;
}

export function ChatListItem({
  name,
  lastMessage,
  timestamp,
  unread,
  avatar,
  isVerified = false,
}: ChatListItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c1e] border-b border-gray-800 transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0 relative">
        {avatar}
        {isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-[#1c1c1e] rounded-full p-0.5">
            <VerifiedBadge size="xs" userName={name} interactive={false} />
          </div>
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-white font-medium truncate">{name}</h3>
            {isVerified && <VerifiedBadge size="sm" userName={name} />}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400 truncate">{lastMessage}</p>
          {unread > 0 && (
            <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
