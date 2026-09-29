import { useState } from "react";
import { Plus, Search, MoreVertical, Camera, Pencil } from "lucide-react";
import { StatusItem } from "./StatusItem";
import { useAuth } from "../context/AuthContext";

const statuses = [
  {
    id: "1",
    name: "Anon #3847",
    avatar: "👤",
    timestamp: "18:36",
    hasStatus: true,
    viewed: false,
  },
  {
    id: "2",
    name: "Anon #7291",
    avatar: "🕶️",
    timestamp: "18:15",
    hasStatus: true,
    viewed: false,
  },
  {
    id: "3",
    name: "Anon #5612",
    avatar: "🎭",
    timestamp: "14:20",
    hasStatus: true,
    viewed: true,
  },
  {
    id: "4",
    name: "Anon #9204",
    avatar: "👤",
    timestamp: "Yesterday",
    hasStatus: true,
    viewed: true,
  },
];

const channelsData = [
  {
    id: "c1",
    name: "GREAT IFE CAMPUS UPDATES",
    avatar: "🏛️",
    lastMessage: "School resumption updates announced for this semester...",
    timestamp: "18:36",
    unread: 17,
  },
  {
    id: "c2",
    name: "NELFUND OFFICIAL UPDATES & GUIDELINES",
    avatar: "🎓",
    lastMessage: "Student loan portal maintenance and new disbursement guidelines.",
    timestamp: "18:36",
    unread: 26,
  },
  {
    id: "c3",
    name: "DEEP QUOTES 🤍🌸",
    avatar: "🌸",
    lastMessage: "Silence is sometimes the best answer to noisy situations.",
    timestamp: "18:35",
    unread: 19,
  },
  {
    id: "c4",
    name: "THE V.O.A MULTIMEDIA",
    avatar: "📻",
    lastMessage: "Live studio session streaming now on encrypted web.",
    timestamp: "18:34",
    unread: 50,
  },
  {
    id: "c5",
    name: "England",
    avatar: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    lastMessage: "📸 Our team lineup announced for the upcoming fixtures 👊",
    timestamp: "18:34",
    unread: 2,
  },
];

export function Status() {
  const { currentUser } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<any | null>(null);

  const recentUpdates = statuses.filter((s) => !s.viewed);
  const viewedUpdates = statuses.filter((s) => s.viewed);

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none relative overflow-y-auto pb-24">
      {/* AnoNote Updates Header */}
      <header className="px-4 py-3 bg-[#111b21] flex items-center justify-between sticky top-0 z-20 border-b border-[#202c33]">
        <h1 className="text-[20px] font-semibold text-[#e9edef]">Updates</h1>
        <div className="flex items-center gap-4 text-[#aebac1]">
          <button className="hover:text-[#e9edef] transition-colors" title="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="hover:text-[#e9edef] transition-colors" title="More options">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Status Heading */}
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-[17px] font-semibold text-[#e9edef]">Status</h2>
      </div>

      {/* My Status Row */}
      <div className="px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#202c33]/40 transition-colors cursor-pointer">
        <div className="relative flex-shrink-0">
          <div className="w-13 h-13 rounded-full bg-[#202c33] flex items-center justify-center text-2xl overflow-hidden border border-[#222d34]">
            {currentUser.avatar || "👤"}
          </div>
          <div className="absolute bottom-0 right-0 bg-[#0084ff] text-white rounded-full p-0.5 border-2 border-[#111b21]">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[15px] text-[#e9edef]">Add status</h3>
          <p className="text-[13px] text-[#8696a0]">Disappears after 24 hours</p>
        </div>
      </div>

      {/* Recent Updates List */}
      {recentUpdates.length > 0 && (
        <div>
          <p className="px-4 py-1.5 text-[13px] font-medium text-[#8696a0]">Recent updates</p>
          {recentUpdates.map((status) => (
            <StatusItem
              key={status.id}
              {...status}
              onClick={() => setSelectedStatus(status)}
            />
          ))}
        </div>
      )}

      {/* Viewed Updates List */}
      {viewedUpdates.length > 0 && (
        <div className="mt-2">
          <p className="px-4 py-1.5 text-[13px] font-medium text-[#8696a0]">Viewed updates</p>
          {viewedUpdates.map((status) => (
            <StatusItem
              key={status.id}
              {...status}
              onClick={() => setSelectedStatus(status)}
            />
          ))}
        </div>
      )}

      {/* Channels Section */}
      <div className="mt-4 pt-2 border-t border-[#202c33]/60">
        <div className="px-4 py-2 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#e9edef]">Channels</h2>
          <button className="px-3.5 py-1 bg-[#202c33] text-[#38bdf8] hover:bg-[#2a3942] rounded-full text-xs font-semibold transition-colors">
            Explore
          </button>
        </div>

        {/* Channel Rows */}
        <div className="divide-y divide-[#202c33]/30">
          {channelsData.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center text-2xl flex-shrink-0">
                {channel.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-semibold text-[14.5px] text-[#e9edef] truncate">
                    {channel.name}
                  </h3>
                  <span className="text-[12px] text-[#38bdf8] font-medium tabular-nums ml-2 flex-shrink-0">
                    {channel.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] text-[#8696a0] truncate">{channel.lastMessage}</p>
                  <span className="bg-[#0084ff] text-white text-[11px] font-bold rounded-full min-w-[19px] h-[19px] px-1.5 flex items-center justify-center flex-shrink-0">
                    {channel.unread}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons on Updates page */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 flex flex-col items-center gap-3 z-30">
        <button
          className="w-10 h-10 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95"
          title="Text status"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="w-14 h-14 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95"
          title="Camera status"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Status View Modal */}
      {selectedStatus && (
        <div
          onClick={() => setSelectedStatus(null)}
          className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col items-center justify-center p-4 animate-in fade-in"
        >
          {/* Progress bar */}
          <div className="w-full max-w-md h-1 bg-[#202c33] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-white animate-[progress_4s_linear]" />
          </div>

          <div className="w-full max-w-md flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center text-xl">
                {selectedStatus.avatar}
              </div>
              <div>
                <p className="text-[#e9edef] font-semibold text-sm">{selectedStatus.name}</p>
                <p className="text-[#8696a0] text-xs">{selectedStatus.timestamp}</p>
              </div>
            </div>
          </div>

          <div className="text-center p-8 bg-[#111b21] border border-[#202c33] rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-[#e9edef] font-medium text-base mb-2">Anonymous Status Update</p>
            <p className="text-[#8696a0] text-xs leading-relaxed">
              "Privacy is not something that I'm merely entitled to, it's an absolute prerequisite."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
