interface StatusItemProps {
  name: string;
  avatar: string;
  timestamp: string;
  viewed: boolean;
  onClick?: () => void;
}

export function StatusItem({ name, avatar, timestamp, viewed, onClick }: StatusItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
    >
      {/* Avatar with status ring */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-13 h-13 rounded-full p-[2.5px] ${
            viewed ? "border-2 border-[#8696a0]/40" : "border-2 border-[#0084ff]"
          }`}
        >
          <div className="w-full h-full rounded-full bg-[#202c33] flex items-center justify-center text-xl overflow-hidden">
            {avatar}
          </div>
        </div>
      </div>

      {/* Status info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-[15px] truncate ${viewed ? "text-[#8696a0]" : "text-[#e9edef]"}`}>
          {name}
        </h3>
        <p className="text-[13px] text-[#8696a0] truncate">{timestamp}</p>
      </div>
    </div>
  );
}
