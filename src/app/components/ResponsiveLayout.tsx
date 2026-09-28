import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router";
import { MessageCircle, Circle, Phone, Settings, ShieldCheck, Search, MoreVertical, UserPlus, Sparkles } from "lucide-react";
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
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col bg-[#1c1c1e] border-r border-gray-800">
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl text-white font-bold tracking-tight">anoNote</h1>
                <p className="text-[10px] text-purple-400 font-mono">anoNote.icepab.name.ng</p>
              </div>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Share connect link / QR"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col py-2 border-b border-gray-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  active
                    ? "bg-purple-600/20 text-purple-400 border-l-4 border-purple-400 font-semibold"
                    : "text-gray-400 hover:bg-[#2c2c2e] hover:text-gray-300 border-l-4 border-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Desktop Sidebar Footer - Identity Card */}
        <div className="p-3 border-t border-gray-800 bg-[#141416] flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-white block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-purple-400 font-mono">{currentUser.anonId}</span>
            </div>
          </Link>
          <button
            onClick={() => setShowConnectModal(true)}
            className="p-2 text-purple-300 hover:text-white bg-[#2c2c2e] hover:bg-purple-600/30 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors"
            title="Connect with friend"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile/Tablet Header - shown when not on desktop */}
        <div className="lg:hidden">
          <header className="bg-[#1c1c1e] px-4 py-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl text-white font-semibold">{getCurrentTab()}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Connect
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden lg:hidden">{children}</div>

        {/* Desktop Main Content - shown on larger screens */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-[#111111]">
          <div className="text-center px-8 max-w-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-purple-600/30">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl text-white font-bold mb-1">anoNote</h2>
            <p className="text-xs text-purple-400 font-mono mb-3">anoNote.icepab.name.ng</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Send and receive messages anonymously with zero-knowledge end-to-end encryption.
              Select a conversation, start a new chat, or share your connect link.
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Connect with Friends
            </button>
          </div>
        </div>

        {/* Bottom Navigation - Mobile/Tablet only */}
        {showBottomNav && (
          <nav className="lg:hidden bg-[#1c1c1e] border-t border-gray-800 px-2 py-2 safe-bottom">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                      active
                        ? "text-purple-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </main>

      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </div>
  );
}
