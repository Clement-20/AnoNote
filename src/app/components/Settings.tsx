import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShieldCheck,
  Key,
  Bell,
  Lock,
  Palette,
  Database,
  HelpCircle,
  Heart,
  ChevronRight,
  User,
  Archive,
  BadgeCheck,
  QrCode,
  Share2,
  Copy,
  Check,
  UserPlus,
  Users,
  LogOut,
  Plus,
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
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://anoNote.icepab.name.ng";
    const url = `${origin}/?connect=${encodeURIComponent(currentUser.anonId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Header - hidden on desktop as ResponsiveLayout shows it */}
      <header className="lg:hidden bg-[#1c1c1e] px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl text-white font-semibold">Settings</h1>
        </div>
      </header>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile section */}
        <Link to="/profile">
          <div className="flex items-center gap-3 px-4 py-4 hover:bg-[#1c1c1e] border-b border-gray-800 transition-colors cursor-pointer">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-600/30">
                {currentUser.avatar}
              </div>
              {currentUser.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-[#1c1c1e] p-1 rounded-full border border-purple-500/40">
                  <VerifiedBadge size="xs" userName={currentUser.name} interactive={false} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-white font-medium truncate">{currentUser.name}</h3>
                {currentUser.isVerified && <VerifiedBadge size="sm" userName={currentUser.name} />}
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                {currentUser.isVerified ? (
                  <span className="text-purple-400 font-medium">Verified Identity</span>
                ) : (
                  "Anonymous identity"
                )}
              </p>
              <p className="text-xs text-purple-400 font-mono mt-0.5">{currentUser.anonId}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </Link>

        {/* CONNECT & SHARE MY LINK QUICK CARD */}
        <div className="p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-purple-400" />
                Frictionless Peer Connect Link
              </p>
              <p className="text-[11px] text-gray-400">Share your link to let friends chat with you instantly</p>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Code
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-1.5 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-purple-500/30 rounded-xl text-xs text-purple-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "Link Copied to Clipboard!" : "Copy Connect Link"}
            </button>
            <button
              onClick={() => setShowConnectModal(true)}
              className="py-1.5 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700 rounded-xl text-xs text-gray-300 transition-colors"
              title="Open Connect dialog"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verification Fast Track / Status */}
        <div className="px-4 py-3 bg-[#18181a] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className={`w-5 h-5 ${currentUser.isVerified ? "text-purple-400" : "text-gray-500"}`} />
            <div>
              <p className="text-white text-xs font-semibold">
                {currentUser.isVerified ? "Trust Verification: Active" : "Get Cryptographic Verification"}
              </p>
              <p className="text-[11px] text-gray-400">
                {currentUser.isVerified ? "Zero-knowledge proof active" : "Build trust without revealing identity"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowVerifyModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentUser.isVerified
                ? "bg-[#2c2c2e] hover:bg-[#3c3c3e] text-purple-300"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow"
            }`}
          >
            {currentUser.isVerified ? "View Badge" : "Verify Now"}
          </button>
        </div>

        {/* ACCOUNT & IDENTITY MANAGEMENT */}
        <div className="border-b border-gray-800 p-4 bg-[#141416]">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Identities on this Device
            </h4>
            <span className="text-[11px] text-purple-400 font-mono">1-Tap Switch</span>
          </div>

          <div className="space-y-1.5 mb-3">
            {savedAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => switchAccount(account.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  account.id === currentUser.id
                    ? "bg-purple-600/20 border-purple-500/50 text-white shadow-sm"
                    : "bg-[#1c1c1e] hover:bg-[#2c2c2e] border-gray-800 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl">{account.avatar}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate">{account.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{account.anonId}</span>
                  </div>
                </div>
                {account.id === currentUser.id ? (
                  <span className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400 hover:text-white">Switch</span>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link to="/signup" className="block">
              <button className="w-full py-2 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                New Identity
              </button>
            </Link>
            <Link to="/login" className="block">
              <button className="w-full py-2 px-3 bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-gray-700 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-colors">
                <User className="w-3.5 h-3.5 text-purple-400" />
                Log In Existing
              </button>
            </Link>
          </div>
        </div>

        {/* Settings items */}
        <div>
          <Link to="/settings/account">
            <SettingsItem
              icon={Key}
              title="Account and Security"
              description="Security PIN, private keys, device backup"
            />
          </Link>
          <Link to="/settings/notifications">
            <SettingsItem
              icon={Bell}
              title="Notifications"
              description="Message tones, encrypted push alerts"
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
              title="Appearance"
              description="Theme, wallpapers"
            />
          </Link>
          <Link to="/settings/storage">
            <SettingsItem
              icon={Database}
              title="Storage and data"
              description="Network usage, auto-download, export chats"
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
              description="Share anoNote with others"
            />
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of anoNote
          </button>
        </div>

        {/* App info */}
        <div className="px-4 py-4 text-center">
          <p className="text-sm text-gray-400 font-semibold tracking-wide">anoNote</p>
          <p className="text-xs text-purple-400 font-mono mt-0.5">anoNote.icepab.name.ng</p>
          <p className="text-xs text-gray-600 mt-1">Version 2.0.0 • E2EE Active</p>
        </div>
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
