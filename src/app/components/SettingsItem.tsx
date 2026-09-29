import { ChevronRight, LucideIcon } from "lucide-react";

interface SettingsItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function SettingsItem({ icon: Icon, title, description }: SettingsItemProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-[#202c33]/40 border-b border-[#202c33]/40 transition-colors cursor-pointer">
      <Icon className="w-5 h-5 text-[#8696a0] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-[#e9edef] font-medium text-[15px]">{title}</h3>
        <p className="text-[13px] text-[#8696a0] truncate mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#8696a0]/60 flex-shrink-0" />
    </div>
  );
}
