import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  MessageSquare,
  CircleDot,
  Users,
  Phone,
  Settings,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ConnectModal } from "./ConnectModal";
import { subscribeToUserChats, FirestoreChat } from "../services/chatService";
import { subscribeToStatuses } from "../services/statusService";
import { updateNativeAppBadge, notifyNativeRouteChanged } from "../services/flutterBridge";

interface ResponsiveLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function ResponsiveLayout({ children, showBottomNav = true }: ResponsiveLayoutProps) {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Sync route changed to Flutter WebView
  useEffect(() => {
    notifyNativeRouteChanged(location.pathname);
  }, [location.pathname]);

  // Real-time actual count of unread chats
  const [unreadChatsCount, setUnreadChatsCount] = useState<number>(() => {
    try {
      const cached = localStorage.getItem("anonote_chats_cache");
      if (cached && currentUser?.anonId) {
        const chats: FirestoreChat[] = JSON.parse(cached);
        return chats.filter((c) => (c.unreadCount?.[currentUser.anonId] || 0) > 0).length;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [hasUnviewedUpdates, setHasUnviewedUpdates] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser?.anonId) {
      setUnreadChatsCount(0);
      return;
    }
    const unsubscribe = subscribeToUserChats(currentUser.anonId, (chats) => {
      const count = chats.filter((c) => (c.unreadCount?.[currentUser.anonId] || 0) > 0).length;
      setUnreadChatsCount(count);
      updateNativeAppBadge(count);
    });
    return () => unsubscribe();
  }, [currentUser?.anonId]);

  useEffect(() => {
    if (!currentUser?.anonId) return;
    const unsub = subscribeToStatuses(currentUser.anonId, (userGroups) => {
      const unviewed = userGroups.some((g) => g.hasUnviewed);
      setHasUnviewedUpdates(unviewed);
    });
    return () => unsub();
  }, [currentUser?.anonId]);

  const chatsBadge =
    unreadChatsCount > 0
      ? unreadChatsCount > 99
        ? "99+"
        : String(unreadChatsCount)
      : undefined;

  const navItems = [
    { path: "/", icon: MessageSquare, label: "Chats", badge: chatsBadge },
    { path: "/status", icon: CircleDot, label: "Updates", dot: hasUnviewedUpdates },
    { path: "/new-group", icon: Users, label: "Communities" },
    { path: "/calls", icon: Phone, label: "Calls" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/chat/");
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-[#e9edef] overflow-hidden font-sans">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-80 xl:w-[400px] flex-col bg-[#111b21] border-r border-[#202c33] z-20">
        {/* Top Header */}
        <div className="px-4 py-3 bg-[#111b21] flex items-center justify-between border-b border-[#202c33]">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center text-xl overflow-hidden border border-[#222d34]">
                {currentUser.avatar || "👤"}
              </div>
              <div>
                <h1 className="text-base text-[#e9edef] font-semibold tracking-tight leading-tight">AnoNote</h1>
                <p className="text-[11px] text-[#8696a0] font-mono">{currentUser.anonId}</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-1 text-[#aebac1]">
            <Link
              to="/status"
              className="p-2 hover:bg-[#202c33] rounded-full transition-colors text-[#aebac1] hover:text-[#e9edef] relative"
              title="Updates"
            >
              <CircleDot className="w-5 h-5" />
              {hasUnviewedUpdates && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0084ff] rounded-full" />
              )}
            </Link>
            <Link
              to="/new-chat"
              className="p-2 hover:bg-[#202c33] rounded-full transition-colors text-[#aebac1] hover:text-[#e9edef] relative"
              title="New Chat"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadChatsCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#0084ff] text-white font-bold text-[9px] px-1 py-0.2 rounded-full min-w-[14px] text-center">
                  {chatsBadge}
                </span>
              )}
            </Link>
            <Link
              to="/settings"
              className="p-2 hover:bg-[#202c33] rounded-full transition-colors text-[#aebac1] hover:text-[#e9edef]"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Sidebar Content (Chat List) */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0b141a] relative">
        {/* Content for mobile / tablet */}
        <div className="flex-1 overflow-hidden lg:hidden flex flex-col">{children}</div>

        {/* Desktop Empty Splash Screen */}
        <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-center bg-[#0b141a] p-8 relative select-none">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-[#111b21] border border-[#202c33] flex items-center justify-center text-3xl mx-auto mb-6 text-[#0084ff]">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-2xl text-[#e9edef] font-light mb-2">AnoNote for Web</h2>
            <p className="text-[#8696a0] text-sm leading-relaxed mb-6">
              Send and receive end-to-end encrypted messages with zero registration requirements.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#8696a0] bg-[#111b21] px-4 py-2 rounded-full border border-[#202c33]">
              <Lock className="w-3.5 h-3.5 text-[#0084ff]" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {showBottomNav && (
          <nav className="lg:hidden bg-[#111b21] border-t border-[#202c33] px-2 py-1.5 z-30">
            <div className="grid grid-cols-4 items-center max-w-md mx-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center py-1 transition-colors relative"
                  >
                    <div
                      className={`relative px-4 py-0.5 rounded-full flex items-center justify-center transition-colors ${
                        active ? "bg-[#0c3a5e] text-[#38bdf8]" : "text-[#8696a0]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-[#0084ff] text-white font-bold text-[9px] px-1 py-0.2 rounded-full min-w-[14px] text-center">
                          {item.badge}
                        </span>
                      )}
                      {item.dot && (
                        <span className="absolute top-0 right-3 w-2 h-2 bg-[#0084ff] rounded-full" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] mt-1 font-medium ${
                        active ? "text-[#e9edef] font-semibold" : "text-[#8696a0]"
                      }`}
                    >
                      {item.label}
                    </span>
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
