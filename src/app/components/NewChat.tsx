import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Users, UserPlus, Shield, Share2, Copy, Check, QrCode, Sparkles } from "lucide-react";
import { VerifiedBadge } from "./VerifiedBadge";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";

const initialContacts = [
  { id: "1", name: "Anon #3847", avatar: "👤", about: "Hey there! I'm on anoNote", isVerified: true },
  { id: "2", name: "Anon #7291", avatar: "🕶️", about: "Living in the shadows", isVerified: true },
  { id: "3", name: "Anon #5612", avatar: "🎭", about: "Anonymous and free", isVerified: false },
  { id: "4", name: "Anon #9204", avatar: "👤", about: "Keeping it secret", isVerified: false },
  { id: "5", name: "Anon #4156", avatar: "🌑", about: "Mystery is my friend", isVerified: false },
  { id: "6", name: "Anon #8873", avatar: "💭", about: "Thoughts in the void", isVerified: false },
  { id: "7", name: "Anon #2490", avatar: "🔮", about: "Crystal clear anonymity", isVerified: true },
  { id: "8", name: "Anon #6371", avatar: "🎪", about: "Behind the curtain", isVerified: false },
  { id: "9", name: "Anon #1827", avatar: "🌙", about: "Nocturnal sentinel", isVerified: false },
  { id: "10", name: "Anon #5094", avatar: "✨", about: "Sparkling in the dark", isVerified: false },
];

export function NewChat() {
  const navigate = useNavigate();
  const { currentUser, getConnectUrl } = useAuth();
  const [search, setSearch] = useState("");
  const [customAnonId, setCustomAnonId] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem("anonote_contacts");
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = () => {
    const url = getConnectUrl(currentUser.anonId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartRealChat = (customVal?: string) => {
    const raw = (customVal || customAnonId).trim();
    if (!raw) return;

    let formattedName = raw;
    if (raw.includes("connect=")) {
      try {
        const u = new URL(raw);
        formattedName = u.searchParams.get("connect") || raw;
      } catch (e) {
        // use raw
      }
    }

    if (!formattedName.startsWith("Anon")) {
      const digits = formattedName.replace(/[^0-9a-zA-Z]/g, "");
      formattedName = `Anon #${digits || formattedName}`;
    }

    const newId = `anon_${Date.now()}`;
    const newContact = {
      id: newId,
      name: formattedName,
      avatar: "👤",
      about: "Direct encrypted contact on anoNote",
      isVerified: false,
    };

    const updated = [newContact, ...contacts.filter((c: any) => c.name !== formattedName)];
    setContacts(updated);
    localStorage.setItem("anonote_contacts", JSON.stringify(updated));

    // Also add to chat list
    const chats = JSON.parse(localStorage.getItem("anonote_chats") || "[]");
    const newChat = {
      id: newId,
      name: formattedName,
      lastMessage: "Encrypted conversation initiated",
      timestamp: "Just now",
      unread: 0,
      avatar: "👤",
      isVerified: false,
    };
    const filteredChats = chats.filter((c: any) => c.name !== formattedName);
    localStorage.setItem("anonote_chats", JSON.stringify([newChat, ...filteredChats]));

    navigate(`/chat/${newId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate("/")}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white font-medium text-lg">New Encrypted Chat</h2>
        </div>

        {/* Search bar */}
        <div className="flex items-center bg-[#2c2c2e] rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search Anon users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* SHARE YOUR CONNECT LINK BANNER */}
        <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border-b border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentUser.avatar}</span>
              <div>
                <span className="text-xs font-bold text-white">Your ID: {currentUser.anonId}</span>
                <p className="text-[11px] text-gray-400">Share your direct connect link with friends</p>
              </div>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-md"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR & Link
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-1.5 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-purple-500/30 rounded-xl text-xs text-purple-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Link Copied to Clipboard!" : "Copy My Connect Link"}
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="py-1.5 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700 rounded-xl text-xs text-gray-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Direct Connect / Real User Anon ID Input */}
        <div className="p-4 bg-[#18181a] border-b border-gray-800">
          <p className="text-xs text-purple-400 uppercase font-semibold tracking-wider mb-2 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Connect With Any Real User
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste link or type Anon ID (e.g. 5841 or Anon #5841)"
              value={customAnonId}
              onChange={(e) => setCustomAnonId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleStartRealChat()}
              className="flex-1 bg-[#2c2c2e] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-600"
            />
            <button
              onClick={() => handleStartRealChat()}
              disabled={!customAnonId.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-purple-600/30"
            >
              Start Chat
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Provide the Anon ID of any peer on anoNote.icepab.name.ng to initiate an encrypted channel.
          </p>
        </div>

        {/* New group option */}
        <div
          onClick={() => navigate("/new-group")}
          className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c1e] border-b border-gray-800 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">New group</h3>
            <p className="text-xs text-gray-400">Create an anonymous multi-user chat</p>
          </div>
        </div>

        {/* Contacts */}
        <div className="px-4 py-2 bg-[#141416] border-b border-gray-800/60 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">Active Users on anoNote</p>
          <span className="text-[11px] text-purple-400 font-mono">1-Tap Connect</span>
        </div>

        {filteredContacts.map((contact: any) => (
          <div
            key={contact.id}
            onClick={() => handleStartRealChat(contact.name)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c1e] border-b border-gray-800/60 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl flex-shrink-0">
              {contact.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-white font-medium text-sm truncate">{contact.name}</h3>
                {contact.isVerified && <VerifiedBadge size="xs" userName={contact.name} />}
              </div>
              <p className="text-xs text-gray-400 truncate">{contact.about}</p>
            </div>
          </div>
        ))}
      </div>

      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
}
