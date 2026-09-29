import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Info,
  Bell,
  Search,
  Trash2,
  ThumbsDown,
  Shield,
  Palette,
  X,
  VolumeX,
} from "lucide-react";

interface ChatMenuProps {
  isOpen?: boolean;
  chatId?: string;
  onClose: () => void;
  onClearChat?: () => void;
  onWallpaperClick?: () => void;
}

export function ChatMenu({
  isOpen = false,
  chatId,
  onClose,
  onClearChat,
  onWallpaperClick,
}: ChatMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleViewInfo = () => {
    if (chatId) {
      navigate(`/chat/${chatId}/info`);
    }
    onClose();
  };

  const handleWallpaper = () => {
    if (onWallpaperClick) {
      onWallpaperClick();
    }
    onClose();
  };

  const handleClear = () => {
    if (onClearChat) {
      onClearChat();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        ref={menuRef}
        className="bg-[#181822]/95 border border-white/10 rounded-2xl shadow-2xl min-w-[260px] mt-12 mr-2 overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-100"
      >
        <div className="p-1.5 space-y-0.5">
          <MenuItem
            icon={Info}
            label="Contact Info"
            onClick={handleViewInfo}
          />
          <MenuItem
            icon={Palette}
            label="Chat Wallpaper"
            onClick={handleWallpaper}
          />
          <MenuItem
            icon={VolumeX}
            label="Mute Notifications"
            onClick={onClose}
          />

          <div className="h-px bg-white/[0.08] my-1" />

          <MenuItem
            icon={Trash2}
            label="Clear Chat Messages"
            onClick={handleClear}
            danger
          />
          <MenuItem
            icon={Shield}
            label="Block Peer"
            onClick={onClose}
            danger
          />
          <MenuItem
            icon={ThumbsDown}
            label="Report Suspicious User"
            onClick={onClose}
            danger
          />
        </div>
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: any;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold text-left ${
        danger
          ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
          : "text-gray-200 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-gray-400"}`} />
      <span>{label}</span>
    </button>
  );
}
