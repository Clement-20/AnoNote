import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  MessageCircle,
  Circle,
  Phone,
  Settings,
  ShieldCheck,
  UserPlus,
  Lock,
  Wifi,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";

interface ResponsiveLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function ResponsiveLayout({ children, showBottomNav = true }: ResponsiveLayoutProps) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showConnectModal, setShowConnectModal] = useState(false);

  const navItems = [
    { path: "/", icon: MessageCircle, label: "Chats" },
    { path: "/status", icon: Circle, label: "Status" },
    { path: "/calls", icon: Phone, label: "Calls" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/chat/");
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const getCurrentTab = () => {
    if (location.pathname.startsWith("/status")) return "Status";
    if (location.pathname.startsWith("/calls")) return "Calls";
    if (location.pathname.startsWith("/settings")) return "Settings";
    return "Chats";
  };

  return (
    <div className="flex h-screen bg-[#0d0d12] text-gray-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-80 xl:w-[380px] flex-col bg-[#14141a] border-r border-white/[0.08] shadow-2xl relative z-20">
        {/* Sidebar Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] bg-[#171720]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 border border-purple-400/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base text-white font-bold tracking-tight font-display">anoNote</h1>
                <p className="text-[10px] text-purple-400 font-mono">Encrypted Messenger</p>
              </div>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              title="Share connect link / QR"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex items-center justify-between p-2 border-b border-white/[0.06] bg-[#111116] gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-xs"
                    : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Desktop Sidebar Footer - Identity Card */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#111116] flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-3 min-w-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2a2a35] to-[#1c1c24] border border-white/10 flex items-center justify-center text-xl shadow-md group-hover:border-purple-500/50 transition-colors">
              {currentUser.avatar}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate group-hover:text-purple-300 transition-colors">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-purple-400 font-mono block">{currentUser.anonId}</span>
            </div>
          </Link>
          <button
            onClick={() => setShowConnectModal(true)}
            className="p-2.5 text-purple-300 hover:text-white bg-white/[0.06] hover:bg-purple-600/30 rounded-xl border border-white/10 hover:border-purple-500/40 transition-all active:scale-95"
            title="Connect with friend"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile/Tablet Header - shown when not on desktop */}
        <div className="lg:hidden">
          <header className="bg-[#181820]/90 backdrop-blur-xl px-4 py-3 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h1 className="text-base text-white font-bold font-display">{getCurrentTab()}</h1>
              </div>
              <button
                onClick={() => setShowConnectModal(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
            </div>
          </header>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden lg:hidden">{children}</div>

        {/* Desktop Main Empty / Showcase View */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-radial from-[#181824] via-[#0f0f14] to-[#0a0a0d] p-8 relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -top-20 -right-20" />
          <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -left-20" />

          <div className="text-center max-w-lg relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-purple-600/40 border border-purple-400/30 transform hover:scale-105 transition-transform duration-300">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <h2 className="text-3xl text-white font-extrabold tracking-tight font-display mb-2">
              anoNote Messenger
            </h2>
            <p className="text-xs text-purple-400 font-mono mb-4 font-semibold">
              Zero-Knowledge · Ephemeral · Peer-to-Peer
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Select any conversation on the left, start a new anonymous chat, or share your invite link for real-time encrypted messaging.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-3 mb-8 text-left">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                <Lock className="w-4 h-4 text-purple-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-0.5">E2E Encrypted</h4>
                <p className="text-[11px] text-gray-400">Zero plain-text logging</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                <Wifi className="w-4 h-4 text-indigo-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-0.5">Dexie Offline</h4>
                <p className="text-[11px] text-gray-400">Auto-queues & syncs</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                <Phone className="w-4 h-4 text-emerald-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-0.5">Direct Calling</h4>
                <p className="text-[11px] text-gray-400">Audio & video calls</p>
              </div>
            </div>

            <button
              onClick={() => setShowConnectModal(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-xl shadow-purple-600/30 transition-all inline-flex items-center gap-2.5 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Share Connect Link</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation - Mobile/Tablet only */}
        {showBottomNav && (
          <nav className="lg:hidden bg-[#181820]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2 safe-bottom z-30">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                      active
                        ? "text-purple-400 bg-purple-500/10 font-bold"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </main>

      <ConnectModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </div>
  );
}
