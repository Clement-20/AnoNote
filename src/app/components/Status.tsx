import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Camera,
  Pencil,
  X,
  Trash2,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  Palette,
  Image as ImageIcon,
  Radio,
  Lock,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { VerifiedBadge } from "./VerifiedBadge";
import { subscribeToBroadcast } from "../services/chatService";
import {
  subscribeToStatuses,
  publishStatus,
  deleteStatus,
  markStatusViewed,
  UserStatusGroup,
  StatusItemData,
} from "../services/statusService";

const BG_COLORS = [
  "#0b4d75", // AnoNote Blue
  "#1e3a8a", // Navy
  "#0f766e", // Teal
  "#701a75", // Purple
  "#831843", // Pink
  "#b45309", // Amber
  "#18181b", // Dark
];

export function Status() {
  const { currentUser } = useAuth();
  const [otherStatusGroups, setOtherStatusGroups] = useState<UserStatusGroup[]>([]);
  const [myStatusGroup, setMyStatusGroup] = useState<UserStatusGroup | null>(null);

  // Live Broadcast Channel state
  const [broadcastMsg, setBroadcastMsg] = useState("Zero-knowledge encrypted network is operating normally across all nodes.");
  const [broadcastTime, setBroadcastTime] = useState("Now");
  const [showChannelView, setShowChannelView] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({
    "👍": 18,
    "❤️": 34,
    "🔥": 21,
  });

  useEffect(() => {
    const unsub = subscribeToBroadcast((msg, timeStr) => {
      if (msg) {
        setBroadcastMsg(msg);
        setBroadcastTime(timeStr || "Now");
      } else {
        setBroadcastMsg("Zero-knowledge encrypted network is operating normally across all nodes.");
        setBroadcastTime("Now");
      }
    });
    return () => unsub();
  }, []);

  // Status creation modal state
  const [showTextModal, setShowTextModal] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [selectedBgColor, setSelectedBgColor] = useState(BG_COLORS[0]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Active Story Viewing state
  const [viewingGroup, setViewingGroup] = useState<UserStatusGroup | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToStatuses(currentUser.anonId, (otherGroups, myGroup) => {
      setOtherStatusGroups(otherGroups);
      setMyStatusGroup(myGroup);
    });
    return () => unsub();
  }, [currentUser.anonId]);

  const handleOpenMyStatus = () => {
    if (myStatusGroup && myStatusGroup.items.length > 0) {
      setViewingGroup(myStatusGroup);
      setCurrentStoryIndex(0);
    } else {
      setShowTextModal(true);
    }
  };

  const handleOpenGroupStory = (group: UserStatusGroup) => {
    setViewingGroup(group);
    setCurrentStoryIndex(0);
    const firstItem = group.items[0];
    if (firstItem) {
      markStatusViewed(firstItem.id, currentUser.anonId);
    }
  };

  const handlePublishTextStatus = async () => {
    if (!statusText.trim() || isPublishing) return;
    setIsPublishing(true);
    try {
      await publishStatus(currentUser, statusText.trim(), selectedBgColor);
      setStatusText("");
      setShowTextModal(false);
    } catch (e) {
      console.error("Failed to publish status:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await publishStatus(currentUser, "", "#000000", base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDeleteCurrentStory = async () => {
    if (!viewingGroup) return;
    const currentItem = viewingGroup.items[currentStoryIndex];
    if (!currentItem) return;

    await deleteStatus(currentItem.id);

    if (viewingGroup.items.length <= 1) {
      setViewingGroup(null);
    } else {
      setCurrentStoryIndex((prev) => Math.max(0, prev - 1));
    }
  };

  // Story Timer
  useEffect(() => {
    if (!viewingGroup) return;

    const currentItem = viewingGroup.items[currentStoryIndex];
    if (currentItem) {
      markStatusViewed(currentItem.id, currentUser.anonId);
    }

    const timer = setTimeout(() => {
      if (currentStoryIndex < viewingGroup.items.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1);
      } else {
        // Look for next unviewed group
        const currentGroupIdx = otherStatusGroups.findIndex((g) => g.anonId === viewingGroup.anonId);
        if (currentGroupIdx !== -1 && currentGroupIdx < otherStatusGroups.length - 1) {
          const nextGroup = otherStatusGroups[currentGroupIdx + 1];
          setViewingGroup(nextGroup);
          setCurrentStoryIndex(0);
        } else {
          setViewingGroup(null);
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [viewingGroup, currentStoryIndex, otherStatusGroups, currentUser.anonId]);

  const recentUpdates = otherStatusGroups.filter((g) => g.hasUnviewed);
  const viewedUpdates = otherStatusGroups.filter((g) => !g.hasUnviewed);

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none relative overflow-y-auto pb-24">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
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
      <div
        onClick={handleOpenMyStatus}
        className="px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
      >
        <div className="relative flex-shrink-0">
          <div
            className={`w-13 h-13 rounded-full p-[2.5px] ${
              myStatusGroup && myStatusGroup.items.length > 0
                ? "border-2 border-[#0084ff]"
                : "border border-[#222d34]"
            }`}
          >
            <div className="w-full h-full rounded-full bg-[#202c33] flex items-center justify-center text-2xl overflow-hidden">
              {currentUser.avatar || "👤"}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTextModal(true);
            }}
            className="absolute bottom-0 right-0 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-full p-0.5 border-2 border-[#111b21] transition-transform active:scale-95"
            title="Add new status"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[15px] text-[#e9edef]">My status</h3>
          <p className="text-[13px] text-[#8696a0] truncate">
            {myStatusGroup && myStatusGroup.items.length > 0
              ? `${myStatusGroup.items.length} update${myStatusGroup.items.length > 1 ? "s" : ""} • Tap to view`
              : "Tap to add status update"}
          </p>
        </div>
      </div>

      {/* Recent Updates List */}
      {recentUpdates.length > 0 && (
        <div className="mt-2">
          <p className="px-4 py-1.5 text-[13px] font-medium text-[#8696a0]">Recent updates</p>
          {recentUpdates.map((group, idx) => (
            <div
              key={`${group.anonId}_${idx}`}
              onClick={() => handleOpenGroupStory(group)}
              className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
            >
              <div className="w-13 h-13 rounded-full p-[2.5px] border-2 border-[#0084ff] flex-shrink-0">
                <div className="w-full h-full rounded-full bg-[#202c33] flex items-center justify-center text-xl overflow-hidden">
                  {group.avatar}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[15px] text-[#e9edef] truncate">{group.name}</h3>
                <p className="text-[13px] text-[#8696a0]">
                  {new Date(group.latestTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Viewed Updates List */}
      {viewedUpdates.length > 0 && (
        <div className="mt-2">
          <p className="px-4 py-1.5 text-[13px] font-medium text-[#8696a0]">Viewed updates</p>
          {viewedUpdates.map((group, idx) => (
            <div
              key={`${group.anonId}_${idx}`}
              onClick={() => handleOpenGroupStory(group)}
              className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-[#202c33]/40 transition-colors cursor-pointer opacity-75"
            >
              <div className="w-13 h-13 rounded-full p-[2.5px] border-2 border-[#8696a0]/40 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-[#202c33] flex items-center justify-center text-xl overflow-hidden">
                  {group.avatar}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-[15px] text-[#8696a0] truncate">{group.name}</h3>
                <p className="text-[13px] text-[#8696a0]">
                  {new Date(group.latestTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Channels Section */}
      <div className="mt-4 pt-2 border-t border-[#202c33]/60">
        <div className="px-4 py-2 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#e9edef]">Channels</h2>
          <button
            onClick={() => alert("Channel directory features enabled. You are tuned to secure broadcasts.")}
            className="px-3.5 py-1 bg-[#202c33] text-[#38bdf8] hover:bg-[#2a3942] rounded-full text-xs font-semibold transition-colors"
          >
            Explore
          </button>
        </div>

        <div className="divide-y divide-[#202c33]/30">
          <div
            onClick={() => setShowChannelView(true)}
            className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#0084ff]/10 border border-[#0084ff]/20 flex items-center justify-center text-2xl flex-shrink-0">
              🏛️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-semibold text-[14.5px] text-[#e9edef] truncate">
                  ANONOTE NETWORK BROADCAST
                </h3>
                <span className="text-[12px] text-[#38bdf8] font-medium tabular-nums ml-2">{broadcastTime}</span>
              </div>
              <p className="text-[13px] text-[#8696a0] truncate">
                {broadcastMsg}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 flex flex-col items-center gap-3 z-30">
        <button
          onClick={() => setShowTextModal(true)}
          className="w-10 h-10 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95"
          title="Create text status"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95"
          title="Create photo status"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Text Status Creation Modal */}
      {showTextModal && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors select-none"
          style={{ backgroundColor: selectedBgColor }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTextModal(false)}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              {/* Color Palette Switcher */}
              <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-full backdrop-blur-md">
                {BG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedBgColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      selectedBgColor === c ? "scale-110 border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="flex items-center justify-center flex-1 px-4 max-w-lg mx-auto w-full">
            <textarea
              autoFocus
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="Type a status..."
              maxLength={700}
              className="w-full bg-transparent text-white placeholder-white/60 text-2xl md:text-3xl text-center outline-none resize-none font-medium"
              rows={4}
            />
          </div>

          {/* Bottom send button */}
          <div className="flex items-center justify-end">
            <button
              onClick={handlePublishTextStatus}
              disabled={!statusText.trim() || isPublishing}
              className="w-14 h-14 bg-white text-[#0b141a] rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-95 disabled:opacity-40"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Story Viewer */}
      {viewingGroup && viewingGroup.items[currentStoryIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none">
          {/* Progress Bars for all items in group */}
          <div className="p-3 flex gap-1.5 z-20">
            {viewingGroup.items.map((it, idx) => (
              <div key={it.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all ${
                    idx < currentStoryIndex
                      ? "w-full"
                      : idx === currentStoryIndex
                      ? "w-full animate-[progress_5s_linear]"
                      : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Top User Info & Actions */}
          <div className="px-4 py-2 flex items-center justify-between z-20 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center text-xl">
                {viewingGroup.avatar}
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">{viewingGroup.name}</h3>
                <p className="text-xs text-white/70">
                  {new Date(viewingGroup.items[currentStoryIndex].createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {viewingGroup.anonId === currentUser.anonId && (
                <button
                  onClick={handleDeleteCurrentStory}
                  className="p-2 rounded-full bg-black/40 text-red-400 hover:bg-black/60 transition-colors"
                  title="Delete this status"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setViewingGroup(null)}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Story Content & Tap Zones */}
          <div
            className="flex-1 flex items-center justify-center relative p-6 cursor-pointer"
            style={{ backgroundColor: viewingGroup.items[currentStoryIndex].bgColor || "#0b4d75" }}
          >
            {/* Left Tap Zone (Previous) */}
            <div
              onClick={() => setCurrentStoryIndex((prev) => Math.max(0, prev - 1))}
              className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
            />

            {/* Right Tap Zone (Next) */}
            <div
              onClick={() => {
                if (currentStoryIndex < viewingGroup.items.length - 1) {
                  setCurrentStoryIndex((prev) => prev + 1);
                } else {
                  setViewingGroup(null);
                }
              }}
              className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
            />

            {viewingGroup.items[currentStoryIndex].mediaUrl ? (
              <img
                src={viewingGroup.items[currentStoryIndex].mediaUrl}
                alt="Story media"
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <p className="text-white text-2xl md:text-3xl font-medium text-center max-w-lg leading-relaxed whitespace-pre-wrap">
                {viewingGroup.items[currentStoryIndex].text}
              </p>
            )}
          </div>

          {/* Bottom Viewer info */}
          {viewingGroup.anonId === currentUser.anonId && (
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-1.5 text-xs text-white/80 z-20">
              <Eye className="w-4 h-4" />
              <span>
                {viewingGroup.items[currentStoryIndex].viewers?.length || 1} views
              </span>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Broadcast Channel View */}
      {showChannelView && (
        <div className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
          {/* Header */}
          <header className="bg-[#111b21] px-4 py-3 border-b border-[#202c33] flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChannelView(false)}
                className="text-[#aebac1] hover:text-[#e9edef] p-1.5 rounded-full hover:bg-[#202c33] transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#0084ff]/10 border border-[#0084ff]/20 flex items-center justify-center text-xl flex-shrink-0">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[#e9edef] font-semibold text-[16px] leading-tight">ANONOTE NETWORK BROADCAST</h2>
                  <VerifiedBadge size="xs" userName="Broadcast Admin" />
                </div>
                <p className="text-[12px] text-[#8696a0]">Official Channel • 1,489 followers</p>
              </div>
            </div>
            <button className="text-xs bg-[#0084ff] text-white font-semibold px-4 py-1.5 rounded-full hover:bg-[#0070df] transition-colors">
              Following
            </button>
          </header>

          {/* Broadcast feed */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[#0b141a] relative">
            {/* Encryption notice */}
            <div className="flex justify-center">
              <div className="bg-[#182229] border border-[#202c33] text-center rounded-lg px-4 py-2.5 max-w-sm text-[12px] text-[#8696a0] shadow-sm">
                🔒 This is an official verified channel. All posts are signed by the administrator and distributed to all network nodes with zero telemetry collection.
              </div>
            </div>

            {/* Past update message bubble */}
            <div className="max-w-xl mx-auto bg-[#1f2c34] rounded-2xl p-4 shadow-md border border-[#2a3942]/50 relative">
              <p className="text-[14.5px] text-[#e9edef] whitespace-pre-wrap leading-relaxed">
                🔐 Welcome to the official AnoNote Broadcast Channel. Keep notifications active to receive instant updates regarding security, cryptographic upgrades, on-chain features, and network status updates directly from the developers.
              </p>
              <div className="flex items-center justify-between mt-3 text-[11px] text-[#8696a0] border-t border-[#2a3942]/40 pt-2">
                <span>System Post</span>
                <span>Jan 1, 2026</span>
              </div>
            </div>

            {/* Active Live Broadcast update bubble */}
            {broadcastMsg && (
              <div className="max-w-xl mx-auto bg-[#1f2c34] rounded-2xl p-4 shadow-lg border-2 border-[#0084ff]/30 relative animate-in fade-in zoom-in duration-300">
                <div className="absolute -top-3.5 left-4 bg-[#0084ff] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" /> Live Broadcast
                </div>
                <p className="text-[15px] text-[#e9edef] whitespace-pre-wrap leading-relaxed pt-2">
                  {broadcastMsg}
                </p>
                
                {/* Reactions */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#2a3942]/40">
                  {Object.entries(reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setReactions(prev => ({
                          ...prev,
                          [emoji]: prev[emoji] + 1
                        }));
                      }}
                      className="flex items-center gap-1.5 bg-[#182229] hover:bg-[#202c33] border border-[#2a3942] rounded-full px-3 py-1 text-xs text-[#e9edef] transition-colors"
                    >
                      <span>{emoji}</span>
                      <span className="text-[#8696a0] font-medium">{count}</span>
                    </button>
                  ))}
                  <div className="w-[1px] h-4 bg-[#2a3942] mx-1" />
                  {["👍", "❤️", "🔥", "😂", "😮", "🙏"].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setReactions(prev => ({
                          ...prev,
                          [emoji]: (prev[emoji] || 0) + 1
                        }));
                      }}
                      className="hover:scale-125 transition-transform p-1 text-sm text-gray-400 hover:text-white"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] text-[#8696a0]">
                  <span className="text-[#0084ff] font-medium flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Cryptographically Verified
                  </span>
                  <span>{broadcastTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* Locked input style footer */}
          <footer className="bg-[#111b21] border-t border-[#202c33] px-4 py-4 flex items-center justify-center z-10 shadow-lg">
            <div className="bg-[#202c33] text-[#8696a0] rounded-full py-2.5 px-6 max-w-lg w-full flex items-center justify-center gap-2 border border-[#2a3942] text-xs">
              <Lock className="w-4 h-4 text-[#8696a0]" />
              <span>Only administrators can send messages to this channel</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
