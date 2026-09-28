import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Bell,
  Image as ImageIcon,
  Search,
  Lock,
  Trash2,
  ThumbsDown,
  Clock,
  Palette,
  Ban,
  Flag,
} from "lucide-react";
import { DisappearingMessagesModal } from "./DisappearingMessagesModal";
import { WallpaperModal } from "./WallpaperModal";
import { BlockReportModal } from "./BlockReportModal";
import { VerifiedBadge } from "./VerifiedBadge";

const chatDetails: Record<string, any> = {
  "1": { name: "Anon #3847", avatar: "👤", about: "Hey there! I'm on anoNote" },
  "2": { name: "Anon #7291", avatar: "🕶️", about: "Living in the shadows" },
  "3": { name: "Anon #5612", avatar: "🎭", about: "Anonymous and free" },
  "4": { name: "Anon #9204", avatar: "👤", about: "End-to-end encrypted" },
};

export function ChatInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const chat = chatDetails[id || "1"] || {
    name: `Anon #${(id || "1").slice(-4)}`,
    avatar: "👤",
    about: "anoNote anonymous contact",
  };
  const [disappearingSetting, setDisappearingSetting] = useState("off");
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [wallpaper, setWallpaper] = useState("bg-[#0a0a0a]");
  const [blockReportType, setBlockReportType] = useState<'block' | 'report' | null>(null);

  const getSettingLabel = (val: string) => {
    switch (val) {
      case "24h": return "24 hours";
      case "7d": return "7 days";
      case "90d": return "90 days";
      default: return "Off";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={() => navigate(`/chat/${id}`)}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium text-lg">Contact info</h2>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile section */}
        <div className="bg-[#1c1c1e] flex flex-col items-center py-8 border-b border-gray-800">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-6xl mb-4">
            {chat.avatar}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-white text-2xl font-medium">{chat.name}</h2>
            {(["1", "2", "7"].includes(id || "1")) && (
              <VerifiedBadge size="md" userName={chat.name} />
            )}
          </div>
          {(["1", "2", "7"].includes(id || "1")) && (
            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
              <VerifiedBadge size="xs" interactive={false} />
              Cryptographically Verified Anon
            </div>
          )}
          <p className="text-gray-400 text-sm mt-2">{chat.about}</p>
        </div>

        {/* Media section */}
        <div className="mt-4 bg-[#1c1c1e] border-b border-gray-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-medium">Media, links and docs</h3>
            <span className="text-gray-400 text-sm">12</span>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <div className="flex-1 aspect-square bg-[#2c2c2e] rounded-lg flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-500" />
            </div>
            <div className="flex-1 aspect-square bg-[#2c2c2e] rounded-lg flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-500" />
            </div>
            <div className="flex-1 aspect-square bg-[#2c2c2e] rounded-lg flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 bg-[#1c1c1e] border-b border-gray-800">
          <InfoOption icon={Bell} title="Mute notifications" />
          <InfoOption icon={Search} title="Search in conversation" />
          <div onClick={() => setShowWallpaperModal(true)}>
            <InfoOption icon={Palette} title="Wallpaper" subtitle="Custom chat background" />
          </div>
          <div onClick={() => setShowDisappearingModal(true)}>
            <InfoOption
              icon={Clock}
              title="Disappearing messages"
              subtitle={getSettingLabel(disappearingSetting)}
            />
          </div>
        </div>

        {/* Encryption info */}
        <div className="mt-4 bg-[#1c1c1e] px-4 py-4 border-b border-gray-800">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-400 leading-relaxed">
                Messages are end-to-end encrypted with zero-knowledge protocols. Your identity remains
                anonymous on anoNote. No one outside of this chat can read or listen to
                them.
              </p>
            </div>
          </div>
        </div>

        {/* Danger zone / Block & Report */}
        <div className="mt-4 bg-[#1c1c1e] border-b border-gray-800">
          <div onClick={() => setBlockReportType('block')}>
            <InfoOption
              icon={Ban}
              title={`Block ${chat.name}`}
              subtitle="Stop receiving messages & calls"
              textColor="text-red-400"
            />
          </div>
          <div onClick={() => setBlockReportType('report')}>
            <InfoOption
              icon={Flag}
              title={`Report ${chat.name}`}
              subtitle="Submit security & safety report"
              textColor="text-red-400"
            />
          </div>
          <InfoOption
            icon={Trash2}
            title="Delete chat"
            textColor="text-red-400"
          />
        </div>
      </div>

      {showDisappearingModal && (
        <DisappearingMessagesModal
          currentSetting={disappearingSetting}
          onSelect={(opt) => setDisappearingSetting(opt)}
          onClose={() => setShowDisappearingModal(false)}
        />
      )}

      {showWallpaperModal && (
        <WallpaperModal
          currentWallpaper={wallpaper}
          onSelect={(wp) => setWallpaper(wp)}
          onClose={() => setShowWallpaperModal(false)}
        />
      )}

      {blockReportType && (
        <BlockReportModal
          type={blockReportType}
          userName={chat.name}
          onConfirm={() => {
            if (blockReportType === 'block') {
              navigate("/");
            }
          }}
          onClose={() => setBlockReportType(null)}
        />
      )}
    </div>
  );
}

interface InfoOptionProps {
  icon: any;
  title: string;
  subtitle?: string;
  textColor?: string;
}

function InfoOption({
  icon: Icon,
  title,
  subtitle,
  textColor = "text-white",
}: InfoOptionProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#2c2c2e] border-b border-gray-800 last:border-b-0 transition-colors cursor-pointer">
      <Icon className={`w-5 h-5 ${textColor} flex-shrink-0`} />
      <div className="flex-1">
        <h3 className={`font-medium ${textColor}`}>{title}</h3>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}
