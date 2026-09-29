import React, { useEffect, useRef } from "react";
import { Users, Radio, AtSign, Sparkles } from "lucide-react";

export interface TagCandidate {
  tag: string;
  label: string;
  description: string;
  avatar?: string;
  isSpecial?: boolean;
}

interface GroupTagAutocompleteProps {
  isOpen: boolean;
  query: string;
  participants: { anonId: string; name?: string; avatar?: string }[];
  onSelectTag: (tag: string) => void;
  selectedIndex: number;
}

export function GroupTagAutocomplete({
  isOpen,
  query,
  participants,
  onSelectTag,
  selectedIndex,
}: GroupTagAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().replace("@", "").trim();

  // Standard special tags
  const specialTags: TagCandidate[] = [
    {
      tag: "@all",
      label: "@all",
      description: "Notify everyone in this group",
      isSpecial: true,
    },
    {
      tag: "@online",
      label: "@online",
      description: "Notify currently active online peers",
      isSpecial: true,
    },
  ];

  // Map participant tags
  const participantTags: TagCandidate[] = participants.map((p) => ({
    tag: `@${p.anonId}`,
    label: p.name && p.name !== p.anonId ? `${p.name} (${p.anonId})` : p.anonId,
    description: "Group Participant",
    avatar: p.avatar || "👤",
  }));

  const allTags = [...specialTags, ...participantTags];

  // Filter based on query
  const filtered = allTags.filter((item) => {
    if (!cleanQuery) return true;
    return (
      item.tag.toLowerCase().includes(cleanQuery) ||
      item.label.toLowerCase().includes(cleanQuery) ||
      item.description.toLowerCase().includes(cleanQuery)
    );
  });

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-4 right-4 mb-2 bg-[#181824]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-40 animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-56 overflow-y-auto"
    >
      <div className="px-3.5 py-2 border-b border-white/[0.08] flex items-center justify-between bg-[#14141c]">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-400 font-mono uppercase tracking-wider">
          <AtSign className="w-3 h-3" />
          <span>Mention in Group</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">
          Use ↑↓ arrows or click to select
        </span>
      </div>

      <div className="p-1 space-y-0.5">
        {filtered.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={`${item.tag}_${idx}`}
              onClick={() => onSelectTag(item.tag)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-purple-600/25 border border-purple-500/40 text-white shadow-xs"
                  : "hover:bg-white/[0.06] text-gray-300 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    item.tag === "@all"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : item.tag === "@online"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-[#282836] border border-white/10"
                  }`}
                >
                  {item.tag === "@all" ? (
                    <Users className="w-3.5 h-3.5" />
                  ) : item.tag === "@online" ? (
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <span>{item.avatar || "👤"}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate font-mono">
                    {item.tag}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {item.description}
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  isSelected ? "bg-purple-500/30 text-purple-200" : "text-gray-500"
                }`}
              >
                Insert
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
