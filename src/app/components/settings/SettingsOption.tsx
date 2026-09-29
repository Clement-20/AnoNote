import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface SettingsOptionProps {
  title: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  rightContent?: ReactNode;
  showArrow?: boolean;
}

export function SettingsOption({
  title,
  description,
  value,
  onClick,
  rightContent,
  showArrow = false,
}: SettingsOptionProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3.5 border-b border-[#202c33]/40 ${
        onClick ? "hover:bg-[#202c33]/40 active:bg-[#202c33]/60 cursor-pointer transition-colors" : ""
      }`}
    >
      <div className="flex-1 min-w-0 pr-3">
        <h3 className="text-[#e9edef] text-[15px] font-normal leading-snug">{title}</h3>
        {description && (
          <p className="text-[13px] text-[#8696a0] mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {rightContent ? (
        <div className="flex-shrink-0 ml-2">{rightContent}</div>
      ) : value ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[#8696a0] text-sm">{value}</span>
          {showArrow && <ChevronRight className="w-4 h-4 text-[#8696a0]" />}
        </div>
      ) : showArrow ? (
        <ChevronRight className="w-4 h-4 text-[#8696a0] flex-shrink-0" />
      ) : null}
    </div>
  );
}
