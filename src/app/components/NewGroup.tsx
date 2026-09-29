import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, Search, ArrowRight, X } from "lucide-react";
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
      <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] select-none">
        {/* Header */}
        <header className="bg-[#111b21] px-4 py-3 border-b border-[#202c33] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[#e9edef] font-medium text-[16px]">New group</h1>
              <p className="text-[12px] text-[#8696a0]">Add subject</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-6">
          {/* Avatar and Group Name Row */}
          <div className="flex items-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-[#202c33] flex items-center justify-center text-3xl border border-[#2a3942] relative flex-shrink-0">
              {groupAvatar}
            </div>

            <div className="flex-1 border-b border-[#0084ff] pb-1">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Type group subject here..."
                maxLength={25}
                className="w-full bg-transparent text-[#e9edef] placeholder-[#8696a0] outline-none text-[16px]"
                autoFocus
              />
            </div>
            <span className="text-xs text-[#8696a0] tabular-nums">
              {25 - groupName.length}
            </span>
          </div>

          <p className="text-xs text-[#8696a0]">
            Provide a group subject and optional group icon
          </p>

          {/* Group Icon Selection */}
          <div>
            <label className="text-xs font-medium text-[#8696a0] uppercase tracking-wider block mb-2">
              Select Group Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setGroupAvatar(emoji)}
                  className={`aspect-square rounded-full flex items-center justify-center text-2xl transition-colors ${
                    groupAvatar === emoji
                      ? "bg-[#0084ff] text-white"
                      : "bg-[#202c33] hover:bg-[#2a3942]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Selected participants preview */}
          <div>
            <p className="text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-2">
              Participants: {selectedContacts.length + 1}
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="bg-[#202c33] text-[#e9edef] text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>{currentUser.avatar}</span>
                <span>You</span>
              </div>
              {selectedContacts.map((anonId, idx) => (
                <div
                  key={`${anonId}_${idx}`}
                  className="bg-[#202c33] text-[#e9edef] text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
                >
                  <span>👤</span>
                  <span>{anonId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blue Confirm FAB */}
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || isCreating}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#0084ff] hover:bg-[#0070df] disabled:opacity-40 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
        >
          <Check className="w-6 h-6 text-white stroke-[3]" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] select-none">
      {/* Step 1 Header */}
      <header className="bg-[#111b21] px-4 py-3 border-b border-[#202c33] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[#e9edef] font-medium text-[16px]">New group</h1>
            <p className="text-[12px] text-[#8696a0]">
              {selectedContacts.length > 0 ? `${selectedContacts.length} selected` : "Add participants"}
            </p>
          </div>
        </div>
      </header>

      {/* Selected Contacts Pills Row */}
      {selectedContacts.length > 0 && (
        <div className="px-3 py-2 bg-[#111b21] border-b border-[#202c33] flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {selectedContacts.map((anonId, idx) => (
            <span
              key={`${anonId}_${idx}`}
              className="bg-[#202c33] text-[#e9edef] rounded-full px-3 py-1 text-xs flex items-center gap-1.5 font-mono"
            >
              <span>{anonId}</span>
              <button onClick={() => toggleContact(anonId)} className="text-[#8696a0] hover:text-[#e9edef]">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="p-3 bg-[#111b21] border-b border-[#202c33] space-y-2">
        <div className="flex items-center bg-[#202c33] rounded-full px-3.5 py-1.5 text-[#8696a0]">
          <Search className="w-4 h-4 mr-2.5" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[#e9edef] placeholder-[#8696a0] outline-none flex-1 text-sm"
          />
        </div>

        {/* Add custom Anon ID */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Or type Anon ID (e.g. Anon #4819)..."
            value={customPeerInput}
            onChange={(e) => setCustomPeerInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustomPeer()}
            className="flex-1 bg-[#202c33] rounded-lg px-3 py-1.5 text-xs text-[#e9edef] placeholder-[#8696a0] outline-none"
          />
          <button
            onClick={handleAddCustomPeer}
            disabled={!customPeerInput.trim()}
            className="px-3 py-1.5 bg-[#202c33] text-[#38bdf8] font-semibold text-xs rounded-lg disabled:opacity-40 hover:bg-[#2a3942]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Active Peers List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/30">
        {filteredUsers.length === 0 && selectedContacts.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-[#8696a0]">
            No peers found. Use the box above to add any Anon ID!
          </div>
        ) : (
          filteredUsers.map((u: any, idx: number) => {
            const isSelected = selectedContacts.includes(u.anonId);
            return (
              <div
                key={`${u.anonId || u.id || "peer"}_${idx}`}
                onClick={() => toggleContact(u.anonId)}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#202c33] flex items-center justify-center text-xl flex-shrink-0">
                    {u.avatar || "👤"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-[15px] text-[#e9edef] truncate">{u.name || u.anonId}</h3>
                    <p className="text-[13px] text-[#8696a0] truncate">{u.anonId}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-[#0084ff] border-[#0084ff] text-white"
                      : "border-[#8696a0]/40"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Next Blue FAB */}
      {selectedContacts.length > 0 && (
        <button
          onClick={() => setStep(2)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 z-30"
          title="Next"
        >
          <ArrowRight className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
