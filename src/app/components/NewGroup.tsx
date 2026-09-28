import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, Search, Users, UserPlus, Sparkles, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeToActiveUsers, createGroupChat } from "../services/chatService";

export function NewGroup() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [customPeerInput, setCustomPeerInput] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("👥");
  const [isCreating, setIsCreating] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToActiveUsers(currentUser.anonId, (users) => {
      setActiveUsers(users);
    });
    return () => unsub();
  }, [currentUser.anonId]);

  const avatarOptions = ["👥", "🎭", "🎪", "🎨", "🎯", "🎲", "🎮", "🎸", "🎹", "🎺", "🛡️", "🚀", "⚡", "🔥", "💎"];

  const filteredUsers = activeUsers.filter((u: any) =>
    (u.anonId || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleContact = (anonId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(anonId) ? prev.filter((id) => id !== anonId) : [...prev, anonId]
    );
  };

  const handleAddCustomPeer = () => {
    const raw = customPeerInput.trim();
    if (!raw) return;

    let formatted = raw;
    if (raw.includes("connect=")) {
      try {
        const u = new URL(raw);
        formatted = u.searchParams.get("connect") || raw;
      } catch {
        // use raw
      }
    }

    if (formatted.startsWith("Ghost")) {
      formatted = formatted.replace("Ghost", "Anon");
    }
    if (!formatted.startsWith("Anon")) {
      const digits = formatted.replace(/[^0-9a-zA-Z]/g, "");
      formatted = `Anon #${digits || formatted}`;
    }

    if (!selectedContacts.includes(formatted)) {
      setSelectedContacts((prev) => [...prev, formatted]);
    }
    setCustomPeerInput("");
  };

  const handleNext = () => {
    if (selectedContacts.length > 0) {
      setStep(2);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const groupId = await createGroupChat(
        currentUser,
        groupName.trim(),
        groupAvatar,
        selectedContacts
      );
      navigate(`/chat/${groupId}`);
    } catch (err) {
      console.error("Failed to create group chat:", err);
    } finally {
      setIsCreating(false);
    }
  };

  if (step === 2) {
    return (
      <div className="flex flex-col h-screen bg-[#0d0d12] text-gray-100 selection:bg-purple-500/30">
        {/* Header */}
        <header className="bg-[#181820]/90 backdrop-blur-xl px-4 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.08] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-white font-bold text-base font-display">New Encrypted Group</h2>
              <p className="text-[11px] text-purple-400 font-mono">Step 2: Group Details</p>
            </div>
          </div>
        </header>

        {/* Group details form */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-xl mx-auto w-full space-y-4">
          {/* Avatar selection */}
          <div className="bg-[#181822] border border-white/10 rounded-3xl p-5 shadow-xl">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
              Group Icon
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setGroupAvatar(emoji)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    groupAvatar === emoji
                      ? "bg-purple-600 scale-105 shadow-lg shadow-purple-600/40 border border-purple-400"
                      : "bg-[#22222d] hover:bg-[#2c2c3a] border border-white/5"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Group name */}
          <div className="bg-[#181822] border border-white/10 rounded-3xl p-5 shadow-xl">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Privacy Collective, Night Owls, Project Team"
              className="w-full bg-[#20202c] text-white placeholder-gray-500 rounded-2xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/60 transition-all font-medium text-sm"
              autoFocus
            />
          </div>

          {/* Selected members summary */}
          <div className="bg-[#181822] border border-white/10 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Participants ({selectedContacts.length + 1})
              </h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-2.5 bg-[#20202c] rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{currentUser.avatar}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                    <span className="text-[10px] text-purple-400 font-mono">{currentUser.anonId} (You - Creator)</span>
                  </div>
                </div>
              </div>
              {selectedContacts.map((anonId) => (
                <div
                  key={anonId}
                  className="flex items-center justify-between p-2.5 bg-[#20202c] rounded-2xl border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👤</span>
                    <span className="text-xs font-bold text-white font-mono">{anonId}</span>
                  </div>
                  <button
                    onClick={() => toggleContact(anonId)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create button footer */}
        <div className="bg-[#14141a] px-4 py-4 border-t border-white/[0.08]">
          <div className="max-w-xl mx-auto w-full">
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || isCreating}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs md:text-sm transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{isCreating ? "Creating Encrypted Group..." : "Create Encrypted Group"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d0d12] text-gray-100 selection:bg-purple-500/30">
      {/* Header */}
      <header className="bg-[#181820]/90 backdrop-blur-xl px-4 py-3.5 border-b border-white/[0.08]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.08] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-white font-bold text-base font-display">New Group</h2>
              <p className="text-[11px] text-purple-400">Add group participants</p>
            </div>
          </div>
          <button
            onClick={handleNext}
            disabled={selectedContacts.length === 0}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            Next ({selectedContacts.length})
          </button>
        </div>

        {/* Search & Custom ID Input */}
        <div className="space-y-2">
          <div className="flex items-center bg-[#20202c] border border-white/10 rounded-2xl px-3.5 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search active peers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or add Anon ID (e.g. Anon #4819)..."
              value={customPeerInput}
              onChange={(e) => setCustomPeerInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomPeer()}
              className="flex-1 bg-[#20202c] border border-purple-500/30 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors font-mono"
            />
            <button
              onClick={handleAddCustomPeer}
              disabled={!customPeerInput.trim()}
              className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-2xl text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </header>

      {/* Selected pills list */}
      {selectedContacts.length > 0 && (
        <div className="bg-[#15151c] border-b border-white/[0.06] p-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {selectedContacts.map((anonId) => (
            <span
              key={anonId}
              className="bg-purple-600/20 text-purple-200 border border-purple-500/40 rounded-full px-3 py-1 text-xs flex items-center gap-1.5 font-mono shadow-xs"
            >
              <span>{anonId}</span>
              <button onClick={() => toggleContact(anonId)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Active peers list */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
          Active Network Peers
        </p>

        {filteredUsers.length === 0 && selectedContacts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-2xl mx-auto">
              👥
            </div>
            <p className="text-xs text-gray-300 font-semibold">No other active peers discovered right now.</p>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
              Use the top input to type any Anon ID (e.g. Anon #4819) to add them to your encrypted group!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((u: any) => {
              const isSelected = selectedContacts.includes(u.anonId);
              return (
                <div
                  key={u.anonId}
                  onClick={() => toggleContact(u.anonId)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600/15 border-purple-500/40 text-white shadow-sm"
                      : "hover:bg-white/[0.05] border-transparent text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2a2a35] to-[#1c1c24] border border-white/10 flex items-center justify-center text-xl shadow-md">
                      {u.avatar || "👤"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{u.name || u.anonId}</div>
                      <div className="text-[10px] text-purple-400 font-mono">{u.anonId}</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-purple-600 border-purple-500 text-white shadow-xs"
                        : "border-gray-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
