import { useState } from "react";
import { X, Clock, Check } from "lucide-react";

interface DisappearingMessagesModalProps {
  currentSetting: string;
  onSelect: (option: string) => void;
  onClose: () => void;
}

const OPTIONS = [
  { id: "off", label: "Off", description: "Messages do not automatically disappear" },
  { id: "24h", label: "24 hours", description: "New messages disappear 24 hours after being read" },
  { id: "7d", label: "7 days", description: "New messages disappear 7 days after being read" },
  { id: "90d", label: "90 days", description: "New messages disappear 90 days after being read" },
];

export function DisappearingMessagesModal({ currentSetting, onSelect, onClose }: DisappearingMessagesModalProps) {
  const [selected, setSelected] = useState(currentSetting);

  const handleSave = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold text-lg">Disappearing Messages</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            Make messages in this chat disappear. When enabled, new messages will automatically delete themselves after being read according to the selected timer.
          </p>

          <div className="space-y-2 mt-4">
            {OPTIONS.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  selected === opt.id
                    ? "bg-purple-600/15 border-purple-600 text-white"
                    : "bg-[#2c2c2e]/50 border-gray-800 hover:bg-[#2c2c2e] text-gray-300"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{opt.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{opt.description}</div>
                </div>
                {selected === opt.id && (
                  <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-[#111111] border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save Timer
          </button>
        </div>
      </div>
    </div>
  );
}
