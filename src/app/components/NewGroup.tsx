import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, Search, Users } from "lucide-react";

const contacts = [
  { id: "1", name: "Anon #3847", avatar: "👤" },
  { id: "2", name: "Anon #7291", avatar: "🕶️" },
  { id: "3", name: "Anon #5612", avatar: "🎭" },
  { id: "4", name: "Anon #9204", avatar: "👤" },
  { id: "5", name: "Anon #4156", avatar: "🌑" },
  { id: "6", name: "Anon #8873", avatar: "💭" },
  { id: "7", name: "Anon #2490", avatar: "🔮" },
  { id: "8", name: "Anon #6371", avatar: "🎪" },
];

export function NewGroup() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("👥");

  const avatarOptions = ["👥", "🎭", "🎪", "🎨", "🎯", "🎲", "🎮", "🎸", "🎹", "🎺"];

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedContacts.length > 0) {
      setStep(2);
    }
  };

  const handleCreateGroup = () => {
    navigate("/group/g1");
  };

  if (step === 2) {
    return (
      <div className="flex flex-col h-screen bg-[#0a0a0a]">
        {/* Header */}
        <header className="bg-[#1c1c1e] px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-white font-medium text-lg">New Encrypted Group</h2>
          </div>
        </header>

        {/* Group details form */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Avatar selection */}
          <div className="bg-[#1c1c1e] rounded-xl p-6 mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Group Icon
            </label>
            <div className="grid grid-cols-5 gap-3">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setGroupAvatar(emoji)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-3xl transition-all ${
                    groupAvatar === emoji
                      ? "bg-purple-600 scale-110"
                      : "bg-[#2c2c2e] hover:bg-[#3c3c3e]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Group name */}
          <div className="bg-[#1c1c1e] rounded-xl p-6 mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full bg-[#2c2c2e] text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-600"
              autoFocus
            />
          </div>

          {/* Selected members */}
          <div className="bg-[#1c1c1e] rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">
                Participants: {selectedContacts.length}
              </h3>
            </div>
            <div className="space-y-2">
              {selectedContacts.map((id) => {
                const contact = contacts.find((c) => c.id === id);
                if (!contact) return null;
                return (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 py-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl">
                      {contact.avatar}
                    </div>
                    <span className="text-white">{contact.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create button */}
        <div className="bg-[#1c1c1e] px-4 py-4 border-t border-gray-800">
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Create Encrypted Group
          </button>
        </div>
      </div>
    );
  }

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
          <div className="flex-1">
            <h2 className="text-white font-medium text-lg">New Group</h2>
            <p className="text-sm text-gray-400">
              Add participants
            </p>
          </div>
          <button
            onClick={handleNext}
            disabled={selectedContacts.length === 0}
            className="text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Next
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center bg-[#2c2c2e] rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
          />
        </div>
      </header>

      {/* Selected count */}
      {selectedContacts.length > 0 && (
        <div className="bg-purple-600/20 border-b border-purple-600/30 px-4 py-2">
          <p className="text-sm text-purple-300">
            {selectedContacts.length} participant{selectedContacts.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact) => {
          const isSelected = selectedContacts.includes(contact.id);
          return (
            <div
              key={contact.id}
              onClick={() => toggleContact(contact.id)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c1e] border-b border-gray-800 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
                {contact.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {contact.name}
                </h3>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-purple-600 border-purple-600"
                    : "border-gray-600"
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
