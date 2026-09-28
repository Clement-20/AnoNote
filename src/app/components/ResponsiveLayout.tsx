import { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { MessageCircle, Circle, Phone, Settings, ShieldCheck, Search, MoreVertical } from "lucide-react";

interface ResponsiveLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function ResponsiveLayout({ children, showBottomNav = true }: ResponsiveLayoutProps) {
  const location = useLocation();

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
              <ShieldCheck className="w-7 h-7 text-purple-400" />
              <div>
                <h1 className="text-xl text-white font-semibold tracking-tight">anoNote</h1>
                <p className="text-[10px] text-purple-400/80 font-mono">anoNote.icepab.name.ng</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
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
                    ? "bg-purple-600/20 text-purple-400 border-l-4 border-purple-400"
                    : "text-gray-400 hover:bg-[#2c2c2e] hover:text-gray-300 border-l-4 border-transparent"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
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
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden lg:hidden">{children}</div>

        {/* Desktop Main Content - shown on larger screens */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-[#111111]">
          <div className="text-center px-8">
            <ShieldCheck className="w-20 h-20 text-purple-400/40 mx-auto mb-4" />
            <h2 className="text-2xl text-white font-semibold mb-2">anoNote</h2>
            <p className="text-xs text-purple-400/80 font-mono mb-2">anoNote.icepab.name.ng</p>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed">
              Send and receive messages anonymously with zero-knowledge end-to-end encryption.
              Select a conversation or start a new encrypted chat.
            </p>
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
    </div>
  );
}
