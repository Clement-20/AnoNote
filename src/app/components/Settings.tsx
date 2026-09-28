import { useState, useEffect } from "react";
import { Link } from "react-router";
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
} from "lucide-react";
import { SettingsItem } from "./SettingsItem";
import { VerifiedBadge } from "./VerifiedBadge";
import { VerificationModal } from "./VerificationModal";

export function Settings() {
  const [userName, setUserName] = useState(() => localStorage.getItem("ghost_note_account_name") || "Anon #8462");
  const [isVerified, setIsVerified] = useState(() => localStorage.getItem("anon_is_verified") === "true");
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("ghost_note_account_name");
      if (stored) setUserName(stored);
      setIsVerified(localStorage.getItem("anon_is_verified") === "true");
    };
    const handleVerificationUpdate = (e: any) => {
      setIsVerified(e.detail?.verified ?? (localStorage.getItem("anon_is_verified") === "true"));
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("verification_updated", handleVerificationUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("verification_updated", handleVerificationUpdate);
    };
  }, []);

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
                🎭
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-[#1c1c1e] p-1 rounded-full border border-purple-500/40">
                  <VerifiedBadge size="xs" userName={userName} interactive={false} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-white font-medium truncate">{userName}</h3>
                {isVerified && <VerifiedBadge size="sm" userName={userName} />}
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                {isVerified ? (
                  <span className="text-purple-400 font-medium">Verified Identity</span>
                ) : (
                  "Anonymous identity"
                )}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </Link>

        {/* Verification Fast Track / Status */}
        <div className="px-4 py-3 bg-[#18181a] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className={`w-5 h-5 ${isVerified ? "text-purple-400" : "text-gray-500"}`} />
            <div>
              <p className="text-white text-xs font-semibold">
                {isVerified ? "Trust Verification: Active" : "Get Cryptographic Verification"}
              </p>
              <p className="text-[11px] text-gray-400">
                {isVerified ? "Zero-knowledge proof active" : "Build trust without revealing identity"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowVerifyModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isVerified
                ? "bg-[#2c2c2e] hover:bg-[#3c3c3e] text-purple-300"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow"
            }`}
          >
            {isVerified ? "View Badge" : "Verify Now"}
          </button>
        </div>

        {/* Settings groups */}
        <div className="mt-4">
          <Link to="/archived">
            <SettingsItem
              icon={Archive}
              title="Archived chats"
              description="Manage inactive conversations"
            />
          </Link>
          <Link to="/settings/account">
            <SettingsItem
              icon={User}
              title="Account"
              description="Privacy, security, change number"
            />
          </Link>
          <Link to="/settings/anonymity">
            <SettingsItem
              icon={Key}
              title="Anonymity"
              description="Manage your Anon cryptographic identity"
            />
          </Link>
          <Link to="/settings/notifications">
            <SettingsItem
              icon={Bell}
              title="Notifications"
              description="Message, group & call tones"
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

        {/* App info */}
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-400 font-semibold tracking-wide">anoNote</p>
          <p className="text-xs text-purple-400 font-mono mt-0.5">anoNote.icepab.name.ng</p>
          <p className="text-xs text-gray-600 mt-1">Version 2.0.0 • E2EE Active</p>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerifiedSuccess={() => setIsVerified(true)}
      />
    </div>
  );
}
