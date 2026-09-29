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
    name: "Anonymous Friends",
    avatar: "👥",
    description: "A secure circle for anonymous discussions on AnoNote",
    createdBy: "Anon #8462",
    createdOn: "January 20, 2026",
    members: [
      { id: "1", name: "Anon #3847", avatar: "👤", role: "admin" },
      { id: "2", name: "Anon #7291", avatar: "🕶️", role: "member" },
      { id: "3", name: "Anon #5612", avatar: "🎭", role: "member" },
      { id: "4", name: "Anon #9204", avatar: "👤", role: "member" },
      { id: "5", name: "Anon #4156", avatar: "🌑", role: "member" },
      { id: "me", name: "You", avatar: "🎭", role: "admin" },
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
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] font-sans select-none overflow-y-auto pb-12">
      {/* Header */}
      <header className="bg-[#111b21] px-4 py-3 flex items-center gap-3 border-b border-[#202c33] sticky top-0 z-20">
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="text-[#aebac1] hover:text-[#e9edef] p-1 -ml-1 rounded-full hover:bg-[#202c33] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-[#e9edef] font-medium text-[16px]">Group info</h2>
      </header>

      {/* Content */}
      <div className="flex-1">
        {/* Profile Card */}
        <div className="bg-[#111b21] flex flex-col items-center py-6 border-b border-[#202c33]">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full bg-[#202c33] flex items-center justify-center text-5xl border-2 border-[#202c33]">
              {group.avatar}
            </div>
            <button className="absolute bottom-0 right-0 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full p-2 transition-colors shadow">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-[#e9edef] mb-1">{group.name}</h2>
          <p className="text-xs text-[#8696a0]">{group.description}</p>
          <p className="text-[11px] text-[#8696a0] mt-1.5">
            Group • {group.members.length} participants
          </p>
        </div>

        {/* Media Row */}
        <div
          onClick={() => setShowMediaGallery(true)}
          className="mt-2 bg-[#111b21] border-b border-[#202c33] px-4 py-3.5 flex items-center justify-between hover:bg-[#202c33]/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <ImageIcon className="w-5 h-5 text-[#8696a0]" />
            <span className="text-[15px] font-medium text-[#e9edef]">Media, links, and docs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8696a0]">
            <span>6 items</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111b21] border-b border-[#202c33] mt-2 divide-y divide-[#202c33]/40">
          <div
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#202c33]/40 cursor-pointer text-[#38bdf8]"
          >
            <Link2 className="w-5 h-5" />
            <span className="text-[15px] font-medium">Invite to group via link</span>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-[#111b21] border-b border-[#202c33] mt-2">
          <div className="px-4 py-3 border-b border-[#202c33]/40 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">
              {group.members.length} Participants
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-[#38bdf8] hover:text-[#0084ff] p-1 rounded-full hover:bg-[#202c33] transition-colors"
              title="Add participant"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          <div className="divide-y divide-[#202c33]/40">
            {group.members.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center text-xl flex-shrink-0">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[15px] text-[#e9edef] font-normal truncate">{member.name}</h4>
                    {["1", "2"].includes(member.id) && (
                      <VerifiedBadge size="xs" userName={member.name} />
                    )}
                  </div>
                  <p className="text-xs text-[#8696a0] capitalize">{member.role === "admin" ? "Group Admin" : "Member"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Encryption notice */}
        <div className="bg-[#111b21] px-4 py-4 border-b border-[#202c33] mt-2 flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-[#8696a0] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#8696a0] leading-relaxed">
            Messages and calls in this group are end-to-end encrypted. No one outside of this group can read or listen to them.
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-[#111b21] border-b border-[#202c33] mt-2 divide-y divide-[#202c33]/40 text-[#f15c6d]">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#202c33]/40 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[15px] font-medium">Exit group</span>
          </div>
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[#202c33]/40 cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-[15px] font-medium">Delete group</span>
          </div>
        </div>
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
