import React from "react";
import { Users, Radio, AtSign, Users2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

/**
 * Parses message text and wraps @mentions and group tags in styled badges
 */
export function formatMessageWithTags(
  text: string,
  currentUserAnonId?: string,
  currentUserName?: string,
  isSent?: boolean
): React.ReactNode {
  if (!text) return "";

  // Regex matches mentions and group URLs (http://.../group/... or /group/...)
  const unifiedRegex = /(@all\b|@everyone\b|@online\b|@Anon\s*#\s*\d+|@Anon_\w+|@[a-zA-Z0-9_#-]+|https?:\/\/[^\s]+?\/group\/[a-zA-Z0-9_-]+|\/group\/[a-zA-Z0-9_-]+)/gi;

  const parts = text.split(unifiedRegex);
  if (parts.length === 1) {
    return text;
  }

  const normalizedMyId = (currentUserAnonId || "").toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
  const normalizedMyName = (currentUserName || "").toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

  return parts.map((part, index) => {
    if (!part) return null;

    const lower = part.toLowerCase();

    // Check if it's a group link (e.g., http://.../group/group_id or /group/group_id)
    if (lower.includes("/group/")) {
      const match = part.match(/\/group\/([a-zA-Z0-9_-]+)/i);
      const groupId = match ? match[1] : "";
      return (
        <Link
          key={index}
          to={`/group/${groupId}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 mx-1 my-1 rounded-xl text-xs font-semibold border transition-all duration-150 shadow-xs hover:scale-[1.02] active:scale-95 ${
            isSent
              ? "bg-[#0c3a5e] border-[#38bdf8]/40 text-[#38bdf8] hover:bg-[#073854]"
              : "bg-[#111b21] border-[#202c33] text-[#0084ff] hover:bg-[#1a262d] hover:border-[#2a3942]"
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>Join Group {groupId.startsWith("group_") ? groupId.replace("group_", "") : groupId}</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-75" />
        </Link>
      );
    }

    // Check if it's @all or @everyone
    if (lower === "@all" || lower === "@everyone") {
      return (
        <span
          key={index}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md text-[11.5px] font-bold font-mono tracking-tight shadow-xs ${
            isSent
              ? "bg-amber-400/20 text-amber-200 border border-amber-400/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}
        >
          <Users className="w-3 h-3 text-amber-400 inline" />
          {part}
        </span>
      );
    }

    // Check if it's @online
    if (lower === "@online") {
      return (
        <span
          key={index}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md text-[11.5px] font-bold font-mono tracking-tight shadow-xs ${
            isSent
              ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/40"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          <Radio className="w-3 h-3 text-emerald-400 inline animate-pulse" />
          {part}
        </span>
      );
    }

    // Check if it starts with @ (peer mention)
    if (part.startsWith("@")) {
      const cleanTag = lower.replace(/[^a-zA-Z0-9]/g, "");
      const isMentioningMe =
        (normalizedMyId && cleanTag.includes(normalizedMyId)) ||
        (normalizedMyName && cleanTag.includes(normalizedMyName)) ||
        cleanTag === "you" ||
        cleanTag === "me";

      return (
        <span
          key={index}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md text-[11.5px] font-bold font-mono tracking-tight transition-colors shadow-xs ${
            isMentioningMe
              ? "bg-purple-500/30 text-yellow-300 border border-purple-400/60 ring-1 ring-purple-400/40 animate-pulse"
              : isSent
              ? "bg-white/20 text-purple-100 border border-white/30"
              : "bg-purple-600/25 text-purple-300 border border-purple-500/40 hover:bg-purple-600/35"
          }`}
        >
          <AtSign className="w-2.5 h-2.5 opacity-75 inline" />
          {part.substring(1)}
        </span>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
