import { ChevronRight, LucideIcon } from "lucide-react";

interface SettingsItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function SettingsItem({ icon: Icon, title, description }: SettingsItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c1c1e] border-b border-gray-800 transition-colors cursor-pointer">
      <Icon className="w-6 h-6 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-sm text-gray-400 truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </div>
  );
}
