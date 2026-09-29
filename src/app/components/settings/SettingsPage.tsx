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
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] font-sans select-none">
      {/* Header */}
      <header className="bg-[#111b21] px-4 py-3 flex items-center gap-4 border-b border-[#202c33] sticky top-0 z-20">
        <button
          onClick={() => navigate("/settings")}
          className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-[#e9edef] font-medium text-[17px]">{title}</h2>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">{children}</div>
    </div>
  );
}
