import { useState } from "react";
import { X, Share2, Check } from "lucide-react";

interface ForwardMessageModalProps {
  messageText: string;
  onForward: (targetChatId: string) => void;
  onClose: () => void;
}

const mockChats = [
  { id: "1", name: "Anon #3847", avatar: "👤" },
  { id: "2", name: "Anon #7291", avatar: "🕶️" },
  { id: "3", name: "Anon #5612", avatar: "🎭" },
  { id: "4", name: "Anon #9204", avatar: "👤" },
  { id: "g1", name: "Anonymous Friends 👥", avatar: "👥" },
];

export function ForwardMessageModal({ messageText, onForward, onClose }: ForwardMessageModalProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleSend = () => {
    if (selectedChatId) {
      onForward(selectedChatId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold text-lg">Forward message to...</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 bg-[#2c2c2e]/40 border-b border-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Message content</p>
          <p className="text-sm text-white italic truncate">"{messageText}"</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedChatId === chat.id
                  ? "bg-purple-600/20 border-purple-600 text-white"
                  : "bg-[#2c2c2e]/40 border-gray-800 hover:bg-[#2c2c2e] text-gray-300"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-xl flex-shrink-0">
                {chat.avatar}
              </div>
              <span className="flex-1 font-medium text-white">{chat.name}</span>
              {selectedChatId === chat.id && (
                <Check className="w-5 h-5 text-purple-400" />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-[#111111] border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedChatId}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
