import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Info,
  Bell,
  BellOff,
  Search,
  Trash2,
  ThumbsDown,
  Shield,
  UserMinus,
  LogOut,
} from "lucide-react";

interface GroupChatMenuProps {
  groupId: string;
  onClose: () => void;
}

export function GroupChatMenu({ groupId, onClose }: GroupChatMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleViewInfo = () => {
    navigate(`/group/${groupId}/info`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      <div
        ref={menuRef}
        className="bg-[#1c1c1e] border border-gray-800 rounded-lg shadow-2xl min-w-[280px] mt-12 mr-2"
      >
        <MenuItem icon={Info} label="Group info" onClick={handleViewInfo} />
        <MenuItem icon={Search} label="Search in conversation" onClick={onClose} />
        <MenuItem icon={Bell} label="Mute notifications" onClick={onClose} />

        {/* Safety section - highlighted */}
        <div className="h-px bg-gray-800 my-1" />
        <div className="px-3 py-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Safety</p>
        </div>
        <MenuItem
          icon={Shield}
          label="Report group"
          onClick={onClose}
          danger
          highlight
        />

        <div className="h-px bg-gray-800 my-1" />
        <MenuItem icon={LogOut} label="Exit group" onClick={onClose} danger />
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: any;
  label: string;
  onClick: () => void;
  danger?: boolean;
  highlight?: boolean;
}

function MenuItem({ icon: Icon, label, onClick, danger, highlight }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2c2c2e] transition-colors ${
        highlight ? "bg-red-500/10" : ""
      }`}
    >
      <Icon className={`w-5 h-5 ${danger ? "text-red-400" : "text-gray-400"}`} />
      <span className={`text-sm ${danger ? "text-red-400" : "text-white"} font-medium`}>
        {label}
      </span>
    </button>
  );
}
