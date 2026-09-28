interface StatusItemProps {
  name: string;
  avatar: string;
  timestamp: string;
  viewed: boolean;
}

export function StatusItem({ name, avatar, timestamp, viewed }: StatusItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c1e] border-b border-gray-800 transition-colors cursor-pointer">
      {/* Avatar with status ring */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-14 h-14 rounded-full p-0.5 ${
            viewed
              ? "bg-gray-600"
              : "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600"
          }`}
        >
          <div className="w-full h-full rounded-full bg-[#111111] p-1.5">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl">
              {avatar}
            </div>
          </div>
        </div>
      </div>

      {/* Status info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium truncate ${viewed ? "text-gray-400" : "text-white"}`}>
          {name}
        </h3>
        <p className="text-sm text-gray-400 truncate">{timestamp}</p>
      </div>
    </div>
  );
}
