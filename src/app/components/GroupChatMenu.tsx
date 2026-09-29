import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Info,
  Search,
  VolumeX,
  ThumbsDown,
  Shield,
  LogOut,
  Palette,
} from "lucide-react";

interface GroupChatMenuProps {
  isOpen?: boolean;
  groupId: string;
  onClose: () => void;
  onWallpaperClick?: () => void;
}

export function GroupChatMenu({
  isOpen = false,
  groupId,
  onClose,
  onWallpaperClick,
}: GroupChatMenuProps) {
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
    navigate(`/group/${groupId}/info`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        ref={menuRef}
        className="bg-[#181822]/95 border border-white/10 rounded-2xl shadow-2xl min-w-[260px] mt-12 mr-2 overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-100"
      >
        <div className="p-1.5 space-y-0.5">
          <MenuItem icon={Info} label="Group Details" onClick={handleViewInfo} />
          {onWallpaperClick && (
            <MenuItem
              icon={Palette}
              label="Group Wallpaper"
              onClick={() => {
                onWallpaperClick();
                onClose();
              }}
            />
          )}
          <MenuItem icon={VolumeX} label="Mute Notifications" onClick={onClose} />

          <div className="h-px bg-white/[0.08] my-1" />

          <MenuItem
            icon={Shield}
            label="Report Group"
            onClick={onClose}
            danger
          />
          <MenuItem
            icon={LogOut}
            label="Exit Group"
            onClick={() => {
              navigate("/");
              onClose();
            }}
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
