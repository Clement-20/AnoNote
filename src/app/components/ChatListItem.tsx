import { useState } from "react";
import { VerifiedBadge } from "./VerifiedBadge";
import { Check, CheckCheck, ChevronDown } from "lucide-react";

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
  onArchive?: (id: string) => void;
}

export function ChatListItem({
  id,
  name,
  lastMessage,
  timestamp,
  unread,
  avatar,
  isVerified = false,
  draft,
  isActive = false,
  status = "read",
  onArchive,
}: ChatListItemProps) {
  const [showDropdown, setShowDropdown] = useState(false);

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

        <div className="flex items-center justify-between gap-2 relative">
          {draft ? (
            <p className="text-[13px] truncate flex items-center gap-1 flex-1 min-w-0">
              <span className="text-[#38bdf8] font-medium">Draft:</span>
              <span className="text-[#8696a0]">{draft}</span>
            </p>
          ) : (
            <div className="flex items-center gap-1 text-[13px] text-[#8696a0] truncate flex-1 min-w-0">
              {status === "read" && <CheckCheck className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />}
              {status === "delivered" && <CheckCheck className="w-4 h-4 text-[#8696a0] flex-shrink-0" />}
              {status === "sent" && <Check className="w-4 h-4 text-[#8696a0] flex-shrink-0" />}
              <span className="truncate">{lastMessage || "No messages yet"}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {unread > 0 && !showDropdown && (
              <span className="bg-[#0084ff] text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                {unread}
              </span>
            )}

            {/* Hover Chevron Trigger */}
            <div className="hidden group-hover:block relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="p-1 hover:bg-[#2a3942] rounded-full text-[#8696a0] hover:text-[#e9edef] transition-colors"
                title="Options"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Action Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 bottom-6 bg-[#202c33] border border-[#2a3942] rounded-lg py-1.5 shadow-xl w-24 z-50 text-[#e9edef]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDropdown(false);
                      if (id && onArchive) onArchive(id);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#111b21] transition-colors font-medium text-xs text-[#e9edef]"
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
