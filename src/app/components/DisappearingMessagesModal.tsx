import { useState } from "react";
import { X, Clock, Check } from "lucide-react";

interface DisappearingMessagesModalProps {
  isOpen?: boolean;
  currentSetting: string;
  onSelect?: (option: string) => void;
  onClose: () => void;
}

const OPTIONS = [
  { id: "off", label: "Off", description: "Messages do not automatically disappear" },
  { id: "24h", label: "24 hours", description: "New messages disappear 24 hours after being read" },
  { id: "7d", label: "7 days", description: "New messages disappear 7 days after being read" },
  { id: "90d", label: "90 days", description: "New messages disappear 90 days after being read" },
];

export function DisappearingMessagesModal({
  isOpen = true,
  currentSetting,
  onSelect,
  onClose,
}: DisappearingMessagesModalProps) {
  const [selected, setSelected] = useState(currentSetting);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof onSelect === "function") {
      onSelect(selected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-[#181822] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#15151c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-white font-bold text-base font-display">Disappearing Messages</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Make messages in this chat disappear. When enabled, new messages will automatically delete themselves after being read according to the selected timer.
          </p>

          <div className="space-y-2 mt-2">
            {OPTIONS.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selected === opt.id
                    ? "bg-purple-600/15 border-purple-500 text-white shadow-sm"
                    : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.07] text-gray-300"
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-xs md:text-sm text-white">{opt.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{opt.description}</div>
                </div>
                {selected === opt.id && (
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#14141a] border-t border-white/[0.08] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 active:scale-95"
          >
            Save Timer
          </button>
        </div>
      </div>
    </div>
  );
}
