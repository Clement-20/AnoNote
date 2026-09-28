import { useState } from "react";
import { X, Palette, Check } from "lucide-react";

interface WallpaperModalProps {
  currentWallpaper: string;
  onSelect: (wallpaperClass: string) => void;
  onClose: () => void;
}

const WALLPAPERS = [
  { id: "bg-[#0a0a0a]", name: "Solid Dark (Default)", preview: "bg-[#0a0a0a]" },
  { id: "bg-gradient-to-br from-gray-900 via-purple-950 to-black", name: "Midnight Purple", preview: "bg-gradient-to-br from-gray-900 via-purple-950 to-black" },
  { id: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950", name: "Cyber Slate", preview: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950" },
  { id: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black", name: "Deep Space", preview: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black" },
  { id: "bg-gradient-to-br from-emerald-950 via-gray-900 to-black", name: "Matrix Emerald", preview: "bg-gradient-to-br from-emerald-950 via-gray-900 to-black" },
];

export function WallpaperModal({ currentWallpaper, onSelect, onClose }: WallpaperModalProps) {
  const [selected, setSelected] = useState(currentWallpaper);

  const handleSave = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold text-lg">Chat Wallpaper</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            Choose a custom background wallpaper for this conversation to personalize your messaging interface.
          </p>

          <div className="grid grid-cols-1 gap-3 mt-4">
            {WALLPAPERS.map((wp) => (
              <div
                key={wp.id}
                onClick={() => setSelected(wp.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selected === wp.id
                    ? "border-purple-600 ring-2 ring-purple-600/50"
                    : "border-gray-800 hover:border-gray-700"
                } ${wp.preview}`}
              >
                <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center bg-black/30">
                  👻
                </div>
                <span className="flex-1 font-medium text-white">{wp.name}</span>
                {selected === wp.id && (
                  <Check className="w-5 h-5 text-purple-400" />
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
            Apply Wallpaper
          </button>
        </div>
      </div>
    </div>
  );
}
