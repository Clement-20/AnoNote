import { useState } from "react";
import { X, Clock, Check } from "lucide-react";

interface DisappearingMessagesModalProps {
  isOpen?: boolean;
  currentSetting: string;
  onSelect?: (option: string) => void;
  onSave?: (option: string) => void;
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
  onSave,
  onClose,
}: DisappearingMessagesModalProps) {
  const [selected, setSelected] = useState(currentSetting);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof onSelect === "function") {
      onSelect(selected);
    }
    if (typeof onSave === "function") {
      onSave(selected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#111b21] border border-[#202c33] rounded-lg w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-[#202c33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-[#e9edef] font-medium text-base">Disappearing Messages</h3>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-[#8696a0] leading-relaxed">
            Make messages in this chat disappear for more privacy. When enabled, new messages will disappear after the selected duration.
          </p>

          <div className="space-y-2 mt-2">
            {OPTIONS.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition-all ${
                  selected === opt.id
                    ? "bg-[#202c33] border-[#0284c7] text-[#e9edef]"
                    : "bg-[#111b21] border-[#202c33] hover:bg-[#202c33]/40 text-[#8696a0]"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-[#e9edef]">{opt.label}</div>
                  <div className="text-xs text-[#8696a0] mt-0.5">{opt.description}</div>
                </div>
                {selected === opt.id && (
                  <Check className="w-4 h-4 text-[#38bdf8] flex-shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#0b141a] border-t border-[#202c33] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#8696a0] hover:text-[#e9edef] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
