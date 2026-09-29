import { useState } from "react";
import { Phone, Video, Search, MoreVertical, Link2, PhoneCall } from "lucide-react";
import { CallItem } from "./CallItem";
import { useNavigate } from "react-router";

const calls = [
  {
    id: "1",
    name: "Anon #3847",
    avatar: "👤",
    timestamp: "Today, 14:45",
    type: "video" as const,
    incoming: true,
    missed: false,
    isVerified: true,
  },
  {
    id: "2",
    name: "Anon #7291",
    avatar: "🕶️",
    timestamp: "Today, 13:15",
    type: "audio" as const,
    incoming: false,
    missed: false,
    isVerified: true,
  },
  {
    id: "3",
    name: "Anon #5612",
    avatar: "🎭",
    timestamp: "Yesterday, 23:30",
    type: "video" as const,
    incoming: true,
    missed: true,
    isVerified: false,
  },
  {
    id: "4",
    name: "Anon #9204",
    avatar: "👤",
    timestamp: "Yesterday, 17:20",
    type: "audio" as const,
    incoming: false,
    missed: false,
    isVerified: false,
  },
  {
    id: "5",
    name: "Anon #4156",
    avatar: "🌑",
    timestamp: "2/5/26, 15:45",
    type: "video" as const,
    incoming: true,
    missed: false,
    isVerified: false,
  },
];

export function Calls() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none relative overflow-y-auto pb-20">
      {/* Header */}
      <header className="px-4 py-3 bg-[#111b21] flex items-center justify-between sticky top-0 z-20 border-b border-[#202c33]">
        <h1 className="text-[20px] font-semibold text-[#e9edef]">Calls</h1>
        <div className="flex items-center gap-4 text-[#aebac1]">
          <button className="hover:text-[#e9edef] transition-colors" title="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="hover:text-[#e9edef] transition-colors" title="More options">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Create call link row */}
      <div className="px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#202c33]/40 transition-colors cursor-pointer border-b border-[#202c33]/40">
        <div className="w-12 h-12 rounded-full bg-[#0084ff] flex items-center justify-center text-white flex-shrink-0">
          <Link2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[#e9edef] font-medium text-[15px]">Create call link</h3>
          <p className="text-[13px] text-[#8696a0]">Share a link for your anoNote call</p>
        </div>
      </div>

      {/* Recent calls heading */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[14px] font-medium text-[#8696a0]">Recent</p>
      </div>

      {/* Calls list */}
      <div className="divide-y divide-[#202c33]/30">
        {calls.map((call) => (
          <CallItem
            key={call.id}
            {...call}
            onCall={() => navigate(`/call/call_${call.id}${call.type === "video" ? "?video=true" : ""}`)}
          />
        ))}
      </div>

      {/* New Call Blue FAB */}
      <button
        onClick={() => navigate("/new-chat")}
        className="fixed bottom-20 lg:bottom-6 right-5 w-14 h-14 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 z-30"
        title="Start Call"
      >
        <PhoneCall className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
