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
  { id: "g1", name: "Anonymous Friends", avatar: "👥" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#111b21] border border-[#202c33] rounded-lg w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-4 py-3.5 border-b border-[#202c33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-[#e9edef] font-medium text-base">Forward message</h3>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-2.5 bg-[#202c33]/40 border-b border-[#202c33]">
          <p className="text-xs text-[#8696a0] mb-0.5">Content</p>
          <p className="text-sm text-[#e9edef] italic truncate">"{messageText}"</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-[#202c33]/30">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                selectedChatId === chat.id
                  ? "bg-[#202c33] border border-[#0284c7] text-white"
                  : "hover:bg-[#202c33]/40 text-[#e9edef]"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center text-xl flex-shrink-0">
                {chat.avatar}
              </div>
              <span className="flex-1 font-normal text-sm text-[#e9edef]">{chat.name}</span>
              {selectedChatId === chat.id && (
                <Check className="w-4 h-4 text-[#38bdf8]" />
              )}
            </div>
          ))}
        </div>

        <div className="px-4 py-3 bg-[#0b141a] border-t border-[#202c33] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#8696a0] hover:text-[#e9edef] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedChatId}
            className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 text-white rounded-md text-xs font-medium transition-colors"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
