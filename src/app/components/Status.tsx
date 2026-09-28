import { Plus, ShieldCheck } from "lucide-react";
import { StatusItem } from "./StatusItem";

const myStatus = {
  id: "my-status",
  name: "My Status",
  avatar: "🎭",
  timestamp: "Tap to add status",
  hasStatus: false,
};

const statuses = [
  {
    id: "1",
    name: "Anon #3847",
    avatar: "👤",
    timestamp: "5 minutes ago",
    hasStatus: true,
    viewed: false,
  },
  {
    id: "2",
    name: "Anon #7291",
    avatar: "🕶️",
    timestamp: "30 minutes ago",
    hasStatus: true,
    viewed: false,
  },
  {
    id: "3",
    name: "Anon #5612",
    avatar: "🎭",
    timestamp: "1 hour ago",
    hasStatus: true,
    viewed: true,
  },
  {
    id: "4",
    name: "Anon #9204",
    avatar: "👤",
    timestamp: "2 hours ago",
    hasStatus: true,
    viewed: true,
  },
  {
    id: "5",
    name: "Anon #4156",
    avatar: "🌑",
    timestamp: "Yesterday",
    hasStatus: true,
    viewed: true,
  },
];

const recentUpdates = statuses.filter((s) => !s.viewed);
const viewedUpdates = statuses.filter((s) => s.viewed);

export function Status() {
  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl text-white font-semibold">Status</h1>
        </div>
      </header>

      {/* Status list */}
      <div className="flex-1 overflow-y-auto">
        {/* My Status */}
        <div className="px-4 py-3 bg-[#1c1c1e] border-b border-gray-800">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl">
                {myStatus.avatar}
              </div>
              <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{myStatus.name}</h3>
              <p className="text-sm text-gray-400">{myStatus.timestamp}</p>
            </div>
          </div>
        </div>

        {/* Recent updates */}
        {recentUpdates.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-[#0a0a0a]">
              <p className="text-sm text-gray-400">Recent updates</p>
            </div>
            {recentUpdates.map((status) => (
              <StatusItem key={status.id} {...status} />
            ))}
          </div>
        )}

        {/* Viewed updates */}
        {viewedUpdates.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-[#0a0a0a]">
              <p className="text-sm text-gray-400">Viewed updates</p>
            </div>
            {viewedUpdates.map((status) => (
              <StatusItem key={status.id} {...status} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
