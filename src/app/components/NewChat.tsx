import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, UserPlus, Users, QrCode, MoreVertical } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";
import { subscribeToActiveUsers, getOrCreateDirectChat } from "../services/chatService";

export function NewChat() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [customAnonId, setCustomAnonId] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToActiveUsers(currentUser.anonId, (users) => {
      setActiveUsers(users);
    });
    return () => unsub();
  }, [currentUser.anonId]);

  const filteredUsers = activeUsers.filter((u: any) =>
    u.anonId?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartChatWithAnon = async (targetId?: string) => {
    const raw = (targetId || customAnonId).trim();
    if (!raw) return;

    let formattedName = raw;
    if (raw.includes("connect=")) {
      try {
        const u = new URL(raw);
        formattedName = u.searchParams.get("connect") || raw;
      } catch (e) {
        // ignore
      }
    }

    if (formattedName.startsWith("Ghost")) {
      formattedName = formattedName.replace("Ghost", "Anon");
    }

    if (!formattedName.startsWith("Anon")) {
      const digits = formattedName.replace(/[^0-9a-zA-Z]/g, "");
      formattedName = `Anon #${digits || formattedName}`;
    }

    const chatId = await getOrCreateDirectChat(currentUser, formattedName);
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] select-none">
      {/* Select Contact Header */}
      <header className="bg-[#111b21] px-4 py-3 border-b border-[#202c33] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[#e9edef] font-medium text-[16px]">Select contact</h1>
            <p className="text-[12px] text-[#8696a0]">
              {activeUsers.length + 1} contacts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#aebac1]">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1 hover:text-[#e9edef] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <button className="p-1 hover:text-[#e9edef] transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search Bar if toggled */}
      {showSearch && (
        <div className="p-3 bg-[#111b21] border-b border-[#202c33]">
          <div className="flex items-center bg-[#202c33] rounded-full px-3.5 py-1.5 text-[#8696a0]">
            <Search className="w-4 h-4 mr-2.5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[#e9edef] placeholder-[#8696a0] outline-none flex-1 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Main List */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Action Rows */}
        <div className="border-b border-[#202c33]/40">
          {/* New Group */}
          <div
            onClick={() => navigate("/new-group")}
            className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#0084ff] flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-medium text-[15px] text-[#e9edef]">New group</span>
          </div>

          {/* New Contact / Any Anon ID */}
          <div
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="flex items-center justify-between px-4 py-3 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#0084ff] flex items-center justify-center text-white">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="font-medium text-[15px] text-[#e9edef] block">New contact / Anon ID</span>
                <span className="text-[12px] text-[#8696a0]">Chat directly with any Anon ID</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConnectModal(true);
              }}
              className="text-[#0084ff] p-2 hover:bg-[#202c33] rounded-full"
              title="QR code"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          {/* Input field if expanded */}
          {showCustomInput && (
            <div className="px-4 py-2.5 bg-[#111b21] flex gap-2">
              <input
                type="text"
                placeholder="Type Anon ID (e.g. Anon #4819)..."
                value={customAnonId}
                onChange={(e) => setCustomAnonId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartChatWithAnon()}
                className="flex-1 bg-[#202c33] border border-[#2a3942] rounded-lg px-3 py-2 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none"
                autoFocus
              />
              <button
                onClick={() => handleStartChatWithAnon()}
                disabled={!customAnonId.trim()}
                className="px-4 py-2 bg-[#0084ff] hover:bg-[#0070df] text-white font-semibold text-xs rounded-lg disabled:opacity-40"
              >
                Chat
              </button>
            </div>
          )}

          {/* New Community */}
          <div
            onClick={() => navigate("/new-group")}
            className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#0084ff] flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-medium text-[15px] text-[#e9edef]">New community</span>
          </div>
        </div>

        {/* Contacts Header */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[13px] font-medium text-[#8696a0]">Contacts on anoNote</p>
        </div>

        {/* Contacts List */}
        <div className="divide-y divide-[#202c33]/30">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 px-4 text-[#8696a0] text-xs">
              No active peers discovered right now. Use the "New contact" option above or share your invite link.
            </div>
          ) : (
            filteredUsers.map((u: any) => (
              <div
                key={u.anonId}
                onClick={() => handleStartChatWithAnon(u.anonId)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#202c33]/40 transition-colors cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#202c33] flex items-center justify-center text-xl flex-shrink-0">
                  {u.avatar || "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-[15px] text-[#e9edef] truncate">{u.name || u.anonId}</h3>
                    {u.isVerified && <VerifiedBadge size="xs" userName={u.name || u.anonId} />}
                  </div>
                  <p className="text-[13px] text-[#8696a0] truncate">{u.about || "Hey there! I am using anoNote."}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </div>
  );
}
