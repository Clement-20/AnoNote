import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Bell,
  Search,
  Lock,
  Trash2,
  ThumbsDown,
  LogOut,
  UserPlus,
  Edit2,
  Shield,
  Link2,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { GroupInviteModal } from "./GroupInviteModal";
import { GroupMediaGallery } from "./GroupMediaGallery";
import { VerifiedBadge } from "./VerifiedBadge";

const groupDetails: Record<string, any> = {
  "g1": {
    name: "Anonymous Friends 👥",
    avatar: "👥",
    description: "A secure circle for anonymous discussions on anoNote",
    createdBy: "Anon #8462",
    createdOn: "January 20, 2026",
    members: [
      { id: "1", name: "Anon #3847", avatar: "👤", role: "admin" },
      { id: "2", name: "Anon #7291", avatar: "🕶️", role: "member" },
      { id: "3", name: "Anon #5612", avatar: "🎭", role: "member" },
      { id: "4", name: "Anon #9204", avatar: "👤", role: "member" },
      { id: "5", name: "Anon #4156", avatar: "🌑", role: "member" },
      { id: "me", name: "You (Anon #8462)", avatar: "🎭", role: "admin" },
    ],
  },
};

export function GroupInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const groupId = id || "g1";
  const group = groupDetails[groupId] || groupDetails["g1"];
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1c1c1e] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white font-medium text-lg">Group Info</h2>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile section */}
        <div className="bg-[#1c1c1e] flex flex-col items-center py-8 border-b border-gray-800">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-6xl">
              {group.avatar}
            </div>
            <button className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-white text-2xl font-medium mb-2">{group.name}</h2>
          <p className="text-gray-400 text-sm">{group.description}</p>
          <p className="text-gray-500 text-xs mt-2">
            Created by {group.createdBy} • {group.createdOn}
          </p>
        </div>

        {/* Media Gallery Section */}
        <div className="mt-4 bg-[#1c1c1e] border-b border-gray-800">
          <div
            onClick={() => setShowMediaGallery(true)}
            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#2c2c2e] transition-colors"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium text-sm">Media, links and docs</h3>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <span>6 photos</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <div
              onClick={() => setShowMediaGallery(true)}
              className="flex-1 aspect-square bg-[#2c2c2e] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-800"
            >
              <img
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80"
                alt="Shared group media 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={() => setShowMediaGallery(true)}
              className="flex-1 aspect-square bg-[#2c2c2e] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-800"
            >
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80"
                alt="Shared group media 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={() => setShowMediaGallery(true)}
              className="flex-1 aspect-square bg-[#2c2c2e] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-800 relative group"
            >
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80"
                alt="Shared group media 3"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium text-xs">
                +3 more
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-[#1c1c1e] border-b border-gray-800 mt-4">
          <InfoOption icon={Bell} title="Mute notifications" />
          <InfoOption icon={Search} title="Search in conversation" />
          <div onClick={() => setShowInviteModal(true)}>
            <InfoOption icon={Link2} title="Invite to group via link" subtitle="Share secure join link" />
          </div>
        </div>

        {/* Members section */}
        <div className="bg-[#1c1c1e] border-b border-gray-800 mt-4">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-medium">
              {group.members.length} participants
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
              title="Add participant via link"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
          {group.members.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 last:border-b-0"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-white font-medium truncate">{member.name}</h3>
                  {(["1", "2"].includes(member.id) || (member.id === "me" && localStorage.getItem("anon_is_verified") === "true")) && (
                    <VerifiedBadge size="xs" userName={member.name} />
                  )}
                </div>
                <p className="text-sm text-gray-400 capitalize">{member.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Encryption info */}
        <div className="bg-[#1c1c1e] px-4 py-4 border-b border-gray-800 mt-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-400 leading-relaxed">
                Messages are end-to-end encrypted. All members remain anonymous on anoNote.
                No one outside of this group can read or listen to them.
              </p>
            </div>
          </div>
        </div>

        {/* Safety section */}
        <div className="bg-[#1c1c1e] border-b border-gray-800 mt-4">
          <div className="px-4 py-2 bg-[#2c2c2e]">
            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Safety Options
            </p>
          </div>
          <InfoOption
            icon={ThumbsDown}
            title="Report group"
            subtitle="Report inappropriate content"
            textColor="text-red-400"
          />
        </div>

        {/* Danger zone */}
        <div className="bg-[#1c1c1e] border-b border-gray-800 mt-4">
          <InfoOption icon={LogOut} title="Exit group" textColor="text-red-400" />
          <InfoOption
            icon={Trash2}
            title="Delete group"
            subtitle="Only admins can delete"
            textColor="text-red-400"
          />
        </div>

        <div className="h-8" />
      </div>

      {showInviteModal && (
        <GroupInviteModal
          groupName={group.name}
          groupId={groupId}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showMediaGallery && (
        <GroupMediaGallery
          groupId={groupId}
          groupName={group.name}
          onClose={() => setShowMediaGallery(false)}
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
