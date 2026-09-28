import { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { MessageCircle, Circle, Phone, Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Bottom Navigation */}
      <nav className="bg-[#1c1c1e] border-t border-gray-800 px-2 py-2">
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
    </div>
  );
}
