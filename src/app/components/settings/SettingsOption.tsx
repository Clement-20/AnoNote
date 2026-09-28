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
      className={`flex items-center justify-between px-4 py-3 border-b border-gray-800 ${
        onClick ? "hover:bg-[#1c1c1e] cursor-pointer transition-colors" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      {rightContent ? (
        <div className="flex-shrink-0 ml-3">{rightContent}</div>
      ) : value ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-400 text-sm">{value}</span>
          {showArrow && <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      ) : showArrow ? (
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      ) : null}
    </div>
  );
}
