import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";

interface CallItemProps {
  name: string;
  avatar: string;
  timestamp: string;
  type: "audio" | "video";
  incoming: boolean;
  missed: boolean;
  isVerified?: boolean;
}

export function CallItem({
  name,
  avatar,
  timestamp,
  type,
  incoming,
  missed,
  isVerified = false,
}: CallItemProps) {
  const CallIcon = type === "video" ? Video : Phone;
  const DirectionIcon = missed
    ? PhoneMissed
    : incoming
    ? PhoneIncoming
    : PhoneOutgoing;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c1e] border-b border-gray-800 transition-colors">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0 relative">
        {avatar}
        {isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-[#1c1c1e] rounded-full p-0.5">
            <VerifiedBadge size="xs" userName={name} interactive={false} />
          </div>
        )}
      </div>

      {/* Call info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className={`font-medium truncate ${missed ? "text-red-400" : "text-white"}`}>
            {name}
          </h3>
          {isVerified && <VerifiedBadge size="xs" userName={name} />}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
          <DirectionIcon
            className={`w-4 h-4 ${missed ? "text-red-400" : "text-gray-400"}`}
          />
          <span>{timestamp}</span>
        </div>
      </div>

      {/* Call button */}
      <button className="text-purple-400 hover:text-purple-300 transition-colors p-2">
        <CallIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
