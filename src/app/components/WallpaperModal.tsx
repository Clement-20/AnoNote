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
  { id: "bg-[#0a0a0a]", name: "Solid Dark (Default)", preview: "bg-[#0a0a0a]" },
  { id: "bg-gradient-to-br from-gray-900 via-purple-950 to-black", name: "Midnight Purple", preview: "bg-gradient-to-br from-gray-900 via-purple-950 to-black" },
  { id: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950", name: "Cyber Slate", preview: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" },
  { id: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black", name: "Deep Space", preview: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black" },
  { id: "bg-gradient-to-br from-emerald-950 via-gray-900 to-black", name: "Matrix Emerald", preview: "bg-gradient-to-br from-emerald-950 via-gray-900 to-black" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-[#181822] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#15151c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-white font-bold text-base font-display">Chat Wallpaper</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Choose a custom background wallpaper for this conversation to personalize your messaging interface.
          </p>

          <div className="grid grid-cols-1 gap-2.5 mt-2">
            {WALLPAPERS.map((wp) => (
              <div
                key={wp.id}
                onClick={() => setSelected(wp.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  selected === wp.id
                    ? "border-purple-500 ring-2 ring-purple-500/40 bg-purple-600/15 text-white"
                    : "border-white/10 hover:border-white/20 text-gray-300"
                } ${wp.preview}`}
              >
                <div className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center bg-black/40 text-lg shadow-sm">
                  👻
                </div>
                <span className="flex-1 font-semibold text-xs md:text-sm text-white">{wp.name}</span>
                {selected === wp.id && (
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
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
            Apply Wallpaper
          </button>
        </div>
      </div>
    </div>
  );
}
