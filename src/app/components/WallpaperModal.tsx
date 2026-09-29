import { useState } from "react";
import { X, Palette, Check } from "lucide-react";

interface WallpaperModalProps {
  isOpen?: boolean;
  currentWallpaper: string;
  onSelect?: (wallpaperClass: string) => void;
  onSelectWallpaper?: (wallpaperClass: string) => void;
  onClose: () => void;
}

const WALLPAPERS = [
  { id: "bg-[#0b141a]", name: "WhatsApp Dark (Default)", preview: "bg-[#0b141a]" },
  { id: "bg-[#111b21]", name: "Deep Charcoal", preview: "bg-[#111b21]" },
  { id: "bg-[#0a192f]", name: "Midnight Navy", preview: "bg-[#0a192f]" },
  { id: "bg-[#14213d]", name: "AnoNote Dark Slate", preview: "bg-[#14213d]" },
  { id: "bg-[#0f172a]", name: "Obsidian", preview: "bg-[#0f172a]" },
];

export function WallpaperModal({
  isOpen = true,
  currentWallpaper,
  onSelect,
  onSelectWallpaper,
  onClose,
}: WallpaperModalProps) {
  const [selected, setSelected] = useState(currentWallpaper);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof onSelect === "function") {
      onSelect(selected);
    }
    if (typeof onSelectWallpaper === "function") {
      onSelectWallpaper(selected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#111b21] border border-[#202c33] rounded-lg w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-[#202c33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-[#e9edef] font-medium text-base">Chat Wallpaper</h3>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-[#8696a0]">
            Select a solid wallpaper color for your chat interface:
          </p>

          <div className="space-y-2 mt-2">
            {WALLPAPERS.map((wp) => (
              <div
                key={wp.id}
                onClick={() => setSelected(wp.id)}
                className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                  selected === wp.id
                    ? "border-[#0284c7] bg-[#202c33] text-white"
                    : "border-[#202c33] hover:bg-[#202c33]/40 text-[#e9edef]"
                }`}
              >
                <div className={`w-8 h-8 rounded-md border border-[#202c33] flex items-center justify-center ${wp.preview} text-sm`}>
                  ✓
                </div>
                <span className="flex-1 text-sm font-normal text-[#e9edef]">{wp.name}</span>
                {selected === wp.id && (
                  <Check className="w-4 h-4 text-[#38bdf8] flex-shrink-0" />
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
            Set Wallpaper
          </button>
        </div>
      </div>
    </div>
  );
}
