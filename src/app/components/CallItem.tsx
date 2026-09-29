import { Phone, Video, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";

interface CallItemProps {
  name: string;
  avatar: string;
  timestamp: string;
  type: "audio" | "video";
  incoming: boolean;
  missed: boolean;
  isVerified?: boolean;
  onCall?: () => void;
}

export function CallItem({
  name,
  avatar,
  timestamp,
  type,
  incoming,
  missed,
  isVerified = false,
  onCall,
}: CallItemProps) {
  const CallIcon = type === "video" ? Video : Phone;

  return (
    <div className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#202c33]/40 border-b border-[#202c33]/40 transition-colors cursor-pointer">
      {/* Circle Avatar */}
      <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center text-2xl flex-shrink-0 relative overflow-hidden">
        {avatar}
        {isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-[#111b21] rounded-full p-0.5">
            <VerifiedBadge size="xs" userName={name} interactive={false} />
          </div>
        )}
      </div>

      {/* Call Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className={`font-medium text-[15px] truncate ${missed ? "text-[#f15c6d]" : "text-[#e9edef]"}`}>
            {name}
          </h3>
          {isVerified && <VerifiedBadge size="xs" userName={name} />}
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-[#8696a0] mt-0.5">
          {incoming ? (
            <ArrowDownLeft className={`w-3.5 h-3.5 ${missed ? "text-[#f15c6d]" : "text-[#38bdf8]"}`} />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 text-[#38bdf8]" />
          )}
          <span>{timestamp}</span>
        </div>
      </div>

      {/* Call Trigger Button */}
      <button
        onClick={onCall}
        className="text-[#0084ff] hover:text-[#38bdf8] transition-colors p-2 rounded-full hover:bg-[#202c33]"
      >
        <CallIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
