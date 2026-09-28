import { Phone, Video, ShieldCheck } from "lucide-react";
import { CallItem } from "./CallItem";

const calls = [
  {
    id: "1",
    name: "Anon #3847",
    avatar: "👤",
    timestamp: "Today, 2:45 PM",
    type: "video" as const,
    incoming: true,
    missed: false,
    isVerified: true,
  },
  {
    id: "2",
    name: "Anon #7291",
    avatar: "🕶️",
    timestamp: "Today, 1:15 PM",
    type: "audio" as const,
    incoming: false,
    missed: false,
    isVerified: true,
  },
  {
    id: "3",
    name: "Anon #5612",
    avatar: "🎭",
    timestamp: "Yesterday, 11:30 PM",
    type: "video" as const,
    incoming: true,
    missed: true,
    isVerified: false,
  },
  {
    id: "4",
    name: "Anon #9204",
    avatar: "👤",
    timestamp: "Yesterday, 5:20 PM",
    type: "audio" as const,
    incoming: false,
    missed: false,
    isVerified: false,
  },
  {
    id: "5",
    name: "Anon #4156",
    avatar: "🌑",
    timestamp: "2/5/26, 3:45 PM",
    type: "video" as const,
    incoming: true,
    missed: false,
    isVerified: false,
  },
  {
    id: "6",
    name: "Anon #8873",
    avatar: "💭",
    timestamp: "2/4/26, 9:15 AM",
    type: "audio" as const,
    incoming: false,
    missed: false,
    isVerified: false,
  },
  {
    id: "7",
    name: "Anon #2490",
    avatar: "🔮",
    timestamp: "2/3/26, 7:30 PM",
    type: "audio" as const,
    incoming: true,
    missed: true,
    isVerified: true,
  },
];

export function Calls() {
  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl text-white font-semibold">Calls</h1>
        </div>
      </header>

      {/* Calls list */}
      <div className="flex-1 overflow-y-auto">
        {/* Create call link section */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Create encrypted call link</h3>
              <p className="text-sm text-gray-400">
                Share a secure link for your anoNote call
              </p>
            </div>
          </div>
        </div>

        {/* Recent calls */}
        <div className="px-4 py-2">
          <p className="text-sm text-gray-400">Recent</p>
        </div>
        {calls.map((call) => (
          <CallItem key={call.id} {...call} />
        ))}
      </div>

      {/* Floating action button */}
      <button className="fixed bottom-24 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-colors">
        <Phone className="w-6 h-6" />
      </button>
    </div>
  );
}
