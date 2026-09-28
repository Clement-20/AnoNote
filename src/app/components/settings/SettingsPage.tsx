import { ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

interface SettingsPageProps {
  title: string;
  children: ReactNode;
}

export function SettingsPage({ title, children }: SettingsPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={() => navigate("/settings")}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium text-lg">{title}</h2>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
