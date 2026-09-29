import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Key,
  Bell,
  Lock,
  Palette,
  Database,
  HelpCircle,
  Heart,
  QrCode,
  LogOut,
  Check,
  ArrowLeft,
  Search,
} from "lucide-react";
import { SettingsItem } from "./SettingsItem";
import { VerifiedBadge } from "./VerifiedBadge";
import { VerificationModal } from "./VerificationModal";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";

export function Settings() {
  const navigate = useNavigate();
  const { currentUser, savedAccounts, switchAccount, logout } = useAuth();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none overflow-y-auto pb-20">
      {/* AnoNote Settings Top Header */}
      <header className="px-4 py-3 bg-[#111b21] flex items-center justify-between sticky top-0 z-20 border-b border-[#202c33]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[20px] font-semibold text-[#e9edef]">Settings</h1>
        </div>
        <button className="text-[#aebac1] hover:text-[#e9edef] p-1">
          <Search className="w-5 h-5" />
        </button>
      </header>

      {/* Profile Card */}
      <Link to="/profile">
        <div className="flex items-center gap-4 px-4 py-4 hover:bg-[#202c33]/40 border-b border-[#202c33] transition-colors cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
            {currentUser.avatar || "👤"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[#e9edef] font-medium text-[16px] truncate">{currentUser.name}</h2>
              {currentUser.isVerified && <VerifiedBadge size="xs" userName={currentUser.name} />}
            </div>
            <p className="text-[13px] text-[#8696a0] font-mono mt-0.5">{currentUser.anonId}</p>
            <p className="text-[12px] text-[#8696a0] truncate mt-0.5">Available on anoNote</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowConnectModal(true);
            }}
            className="p-2 text-[#0084ff] hover:bg-[#202c33] rounded-full transition-colors"
            title="QR Code"
          >
            <QrCode className="w-6 h-6" />
          </button>
        </div>
      </Link>

      {/* Identity Switcher */}
      <div className="px-4 py-3 border-b border-[#202c33] bg-[#111b21]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-medium text-[#8696a0] uppercase tracking-wider">
            Switch Identity
          </span>
          <Link to="/signup" className="text-xs text-[#0084ff] hover:underline font-medium">
            + New ID
          </Link>
        </div>
        <div className="space-y-1">
          {savedAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => switchAccount(acc.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                acc.id === currentUser.id
                  ? "bg-[#202c33] text-[#38bdf8] font-medium"
                  : "hover:bg-[#202c33]/50 text-[#8696a0]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base">{acc.avatar}</span>
                <span className="truncate text-[#e9edef]">{acc.name}</span>
                <span className="font-mono text-[10px] text-[#8696a0]">({acc.anonId})</span>
              </div>
              {acc.id === currentUser.id && <Check className="w-4 h-4 text-[#38bdf8]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Navigation List */}
      <div>
        <Link to="/settings/account">
          <SettingsItem
            icon={Key}
            title="Account"
            description="Security notifications, private keys"
          />
        </Link>
        <Link to="/settings/privacy">
          <SettingsItem
            icon={Lock}
            title="Privacy"
            description="Block contacts, disappearing messages"
          />
        </Link>
        <Link to="/settings/appearance">
          <SettingsItem
            icon={Palette}
            title="Chats"
            description="Theme, wallpapers, chat history"
          />
        </Link>
        <Link to="/settings/notifications">
          <SettingsItem
            icon={Bell}
            title="Notifications"
            description="Message, group & call tones"
          />
        </Link>
        <Link to="/settings/storage">
          <SettingsItem
            icon={Database}
            title="Storage and data"
            description="Network usage, auto-download"
          />
        </Link>
        <Link to="/settings/help">
          <SettingsItem
            icon={HelpCircle}
            title="Help"
            description="Help center, contact us, privacy policy"
          />
        </Link>
        <Link to="/settings/invite">
          <SettingsItem
            icon={Heart}
            title="Invite a friend"
            description="Share anoNote link"
          />
        </Link>
      </div>

      {/* Log out */}
      <div className="p-4 mt-2">
        <button
          onClick={handleSignOut}
          className="w-full py-2.5 px-4 bg-[#202c33] hover:bg-[#2a3942] text-[#f15c6d] rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>

      {/* App version footer */}
      <div className="text-center py-4 text-[#8696a0] text-xs">
        <p className="font-medium text-[#e9edef]">AnoNote</p>
        <p className="mt-0.5 text-[11px]">Version 2.24.18.77 (End-to-End Encrypted)</p>
      </div>

      <VerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerifiedSuccess={() => {}}
      />

      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
}
