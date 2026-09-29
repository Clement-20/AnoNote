import { VerifiedBadge } from "./VerifiedBadge";
import { Check, CheckCheck } from "lucide-react";

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
  status?: "sent" | "delivered" | "read";
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
  status = "read",
}: ChatListItemProps) {
  return (
    <div
      className={`group flex items-center gap-3.5 px-4 py-3 transition-colors cursor-pointer border-b border-[#202c33]/50 ${
        isActive ? "bg-[#202c33]" : "hover:bg-[#202c33]/40 bg-transparent"
      }`}
    >
      {/* Circle Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center text-2xl overflow-hidden select-none">
          {avatar || "👤"}
        </div>
        {isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-[#111b21] rounded-full p-0.5">
            <VerifiedBadge size="xs" userName={name} interactive={false} />
          </div>
        )}
      </div>

      {/* Chat Row Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-medium text-[15px] text-[#e9edef] truncate">
              {name}
            </h3>
            {isVerified && <VerifiedBadge size="xs" userName={name} />}
          </div>
          <span className={`text-[12px] tabular-nums flex-shrink-0 ml-2 ${unread > 0 ? "text-[#38bdf8] font-medium" : "text-[#8696a0]"}`}>
            {timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          {draft ? (
            <p className="text-[13px] truncate flex items-center gap-1">
              <span className="text-[#38bdf8] font-medium">Draft:</span>
              <span className="text-[#8696a0]">{draft}</span>
            </p>
          ) : (
            <div className="flex items-center gap-1 text-[13px] text-[#8696a0] truncate">
              {status === "read" && <CheckCheck className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />}
              {status === "delivered" && <CheckCheck className="w-4 h-4 text-[#8696a0] flex-shrink-0" />}
              {status === "sent" && <Check className="w-4 h-4 text-[#8696a0] flex-shrink-0" />}
              <span className="truncate">{lastMessage || "No messages yet"}</span>
            </div>
          )}

          {unread > 0 && (
            <span className="bg-[#0084ff] text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
