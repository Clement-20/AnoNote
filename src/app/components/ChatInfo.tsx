import { useState, useEffect } from "react";
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
  Share2,
  Copy,
  Check,
  Shield,
  Phone,
  Video,
} from "lucide-react";
import { DisappearingMessagesModal } from "./DisappearingMessagesModal";
import { WallpaperModal } from "./WallpaperModal";
import { BlockReportModal } from "./BlockReportModal";
import { VerifiedBadge } from "./VerifiedBadge";
import { useAuth } from "../context/AuthContext";
import { subscribeToChatMetadata, subscribeToMessages, updateChatEphemeralSetting } from "../services/chatService";

export function ChatInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, getConnectUrl } = useAuth();
  const currentId = id || "general";

  const [liveChatDoc, setLiveChatDoc] = useState<any>(null);
  const [mediaCount, setMediaCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [disappearingSetting, setDisappearingSetting] = useState("off");
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [wallpaper, setWallpaper] = useState("bg-[#0b141a]");
  const [blockReportType, setBlockReportType] = useState<"block" | "report" | null>(null);

  useEffect(() => {
    const unsubMeta = subscribeToChatMetadata(currentId, (data) => {
      setLiveChatDoc(data);
      if (data?.ephemeralSetting) {
        setDisappearingSetting(data.ephemeralSetting);
      }
    });
    const unsubMsgs = subscribeToMessages(currentId, (msgs) => {
      const media = msgs.filter((m) => !!m.mediaUrl);
      setMediaCount(media.length);
    });
    return () => {
      unsubMeta();
      unsubMsgs();
    };
  }, [currentId]);

  const otherParticipant = liveChatDoc?.participants?.find((p: string) => p !== currentUser.anonId);
  const peerData = otherParticipant && liveChatDoc?.participantData?.[otherParticipant];
  const peerName = peerData?.name || otherParticipant || (currentId.startsWith("Anon") ? currentId : `Anon #${currentId.replace(/[^0-9]/g, "") || "4819"}`);
  const peerAvatar = peerData?.avatar || "👤";
  const isPeerVerified = !!peerData?.isVerified;

  const handleCopyPeerLink = () => {
    const link = getConnectUrl(otherParticipant || peerName);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] select-none overflow-y-auto pb-12 font-sans">
      {/* Header */}
      <header className="bg-[#111b21] px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-[#202c33]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/chat/${currentId}`)}
            className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[#e9edef] font-medium text-[16px]">Contact info</h2>
        </div>
      </header>

      {/* Main Profile Card */}
      <div className="flex flex-col items-center py-6 border-b border-[#202c33] bg-[#111b21]">
        <div className="w-28 h-28 rounded-full bg-[#202c33] flex items-center justify-center text-5xl mb-3 overflow-hidden border-2 border-[#202c33]">
          {peerAvatar}
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <h1 className="text-xl font-semibold text-[#e9edef]">{peerName}</h1>
          {isPeerVerified && <VerifiedBadge size="sm" userName={peerName} />}
        </div>
        <p className="text-sm font-mono text-[#38bdf8] mb-4">{otherParticipant || peerName}</p>

        {/* Quick Call & Share Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/call/${currentId}?video=true`)}
            className="flex flex-col items-center gap-1 text-[#38bdf8] hover:text-[#0084ff]"
          >
            <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs">Video</span>
          </button>

          <button
            onClick={() => navigate(`/call/${currentId}`)}
            className="flex flex-col items-center gap-1 text-[#38bdf8] hover:text-[#0084ff]"
          >
            <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-xs">Audio</span>
          </button>

          <button
            onClick={handleCopyPeerLink}
            className="flex flex-col items-center gap-1 text-[#38bdf8] hover:text-[#0084ff]"
          >
            <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center">
              {copiedLink ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </div>
            <span className="text-xs">{copiedLink ? "Copied" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* About section */}
      <div className="px-4 py-3 bg-[#111b21] border-b border-[#202c33] mt-2">
        <p className="text-xs text-[#8696a0] mb-0.5 font-medium">About</p>
        <p className="text-sm text-[#e9edef]">Available on AnoNote</p>
      </div>

      {/* Media Count Row */}
      <div className="px-4 py-3.5 bg-[#111b21] border-b border-[#202c33] mt-2 flex items-center justify-between hover:bg-[#202c33]/40 transition-colors cursor-pointer">
        <div className="flex items-center gap-3.5">
          <ImageIcon className="w-5 h-5 text-[#8696a0]" />
          <span className="text-[15px] font-medium text-[#e9edef]">Media, links, and docs</span>
        </div>
        <span className="text-xs text-[#8696a0] font-medium">{mediaCount} items</span>
      </div>

      {/* Security & Settings List */}
      <div className="bg-[#111b21] border-b border-[#202c33] mt-2 divide-y divide-[#202c33]/40">
        <div
          onClick={() => setShowDisappearingModal(true)}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/40 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Clock className="w-5 h-5 text-[#8696a0]" />
            <div>
              <p className="text-[15px] font-medium text-[#e9edef]">Disappearing messages</p>
              <p className="text-xs text-[#8696a0]">{disappearingSetting === "off" ? "Off" : disappearingSetting}</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setShowWallpaperModal(true)}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/40 cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <Palette className="w-5 h-5 text-[#8696a0]" />
            <span className="text-[15px] font-medium text-[#e9edef]">Chat wallpaper</span>
          </div>
        </div>

        <div className="px-4 py-3.5 flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-[#8696a0] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[15px] font-medium text-[#e9edef]">Encryption</p>
            <p className="text-xs text-[#8696a0] leading-relaxed">
              Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#111b21] border-b border-[#202c33] mt-2 divide-y divide-[#202c33]/40">
        <div
          onClick={() => setBlockReportType("block")}
          className="px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#202c33]/40 cursor-pointer text-[#f15c6d]"
        >
          <Ban className="w-5 h-5" />
          <span className="text-[15px] font-medium">Block {peerName}</span>
        </div>
        <div
          onClick={() => setBlockReportType("report")}
          className="px-4 py-3.5 flex items-center gap-3.5 hover:bg-[#202c33]/40 cursor-pointer text-[#f15c6d]"
        >
          <Flag className="w-5 h-5" />
          <span className="text-[15px] font-medium">Report {peerName}</span>
        </div>
      </div>

      <DisappearingMessagesModal
        isOpen={showDisappearingModal}
        onClose={() => setShowDisappearingModal(false)}
        currentSetting={disappearingSetting}
        onSave={async (s) => {
          setDisappearingSetting(s);
          await updateChatEphemeralSetting(currentId, s);
        }}
      />

      <WallpaperModal
        isOpen={showWallpaperModal}
        onClose={() => setShowWallpaperModal(false)}
        currentWallpaper={wallpaper}
        onSelect={(w) => setWallpaper(w)}
        onSelectWallpaper={(w) => setWallpaper(w)}
      />

      <BlockReportModal
        isOpen={blockReportType !== null}
        type={blockReportType || "block"}
        userName={peerName}
        onClose={() => setBlockReportType(null)}
        onConfirm={() => {
          setBlockReportType(null);
          navigate("/");
        }}
      />
    </div>
  );
}
