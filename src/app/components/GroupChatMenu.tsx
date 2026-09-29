import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Info,
  VolumeX,
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
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-transparent">
      <div
        ref={menuRef}
        className="bg-[#202c33] border border-[#2a3942] rounded-md shadow-xl min-w-[200px] mt-12 mr-2 overflow-hidden py-1.5"
      >
        <MenuItem icon={Info} label="Group info" onClick={handleViewInfo} />
        {onWallpaperClick && (
          <MenuItem
            icon={Palette}
            label="Wallpaper"
            onClick={() => {
              onWallpaperClick();
              onClose();
            }}
          />
        )}
        <MenuItem icon={VolumeX} label="Mute notifications" onClick={onClose} />

        <div className="h-px bg-[#2a3942] my-1" />

        <MenuItem
          icon={Shield}
          label="Report group"
          onClick={onClose}
          danger
        />
        <MenuItem
          icon={LogOut}
          label="Exit group"
          onClick={() => {
            navigate("/");
            onClose();
          }}
          danger
        />
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-sm text-left ${
        danger
          ? "text-[#f15c6d] hover:bg-[#111b21]"
          : "text-[#e9edef] hover:bg-[#111b21]"
      }`}
    >
      <Icon className={`w-4 h-4 ${danger ? "text-[#f15c6d]" : "text-[#8696a0]"}`} />
      <span>{label}</span>
    </button>
  );
}
