import { useState, useEffect } from "react";
import { Phone, Video, Search, MoreVertical, Link2, PhoneCall, Copy, Check, Share2, Trash2 } from "lucide-react";
import { CallItem } from "./CallItem";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { subscribeToCalls, CallRecord } from "../services/callService";

export function Calls() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [callsList, setCallsList] = useState<CallRecord[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCalls(currentUser.anonId, (records) => {
      setCallsList(records);
    });
    return () => unsub();
  }, [currentUser.anonId]);

  const handleCreateCallLink = () => {
    const roomCallId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const url = `${window.location.origin}/call/${roomCallId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      navigate(`/call/${roomCallId}`);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-[#e9edef] select-none relative overflow-y-auto pb-20">
      {/* Header */}
      <header className="px-4 py-3 bg-[#111b21] flex items-center justify-between sticky top-0 z-20 border-b border-[#202c33]">
        <h1 className="text-[20px] font-semibold text-[#e9edef]">Calls</h1>
        <div className="flex items-center gap-4 text-[#aebac1]">
          <button className="hover:text-[#e9edef] transition-colors" title="Search">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:text-[#e9edef] transition-colors p-1"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                className="absolute top-8 right-0 w-48 bg-[#202c33] rounded-md shadow-xl py-2 z-50 text-[#e9edef] text-sm border border-[#2a3942]"
                onClick={() => setShowMenu(false)}
              >
                <button
                  onClick={() => setCallsList([])}
                  className="w-full text-left px-4 py-2 hover:bg-[#111b21] transition-colors flex items-center gap-2 text-[#f15c6d]"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear call log
                </button>
                <button
                  onClick={handleCreateCallLink}
                  className="w-full text-left px-4 py-2 hover:bg-[#111b21] transition-colors flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4 text-[#38bdf8]" />
                  Create call link
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Create call link row */}
      <div
        onClick={handleCreateCallLink}
        className="px-4 py-3.5 flex items-center justify-between hover:bg-[#202c33]/40 transition-colors cursor-pointer border-b border-[#202c33]/40"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#0084ff] flex items-center justify-center text-white flex-shrink-0">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[#e9edef] font-medium text-[15px]">Create call link</h3>
            <p className="text-[13px] text-[#8696a0]">
              {copiedLink ? "Link copied! Opening room..." : "Share a link for your AnoNote call"}
            </p>
          </div>
        </div>

        {copiedLink && (
          <span className="text-xs text-[#38bdf8] flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5" /> Copied
          </span>
        )}
      </div>

      {/* Recent calls heading */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[14px] font-medium text-[#8696a0]">Recent Calls</p>
      </div>

      {/* Calls list */}
      {callsList.length === 0 ? (
        <div className="text-center py-16 px-6 text-[#8696a0]">
          <div className="w-14 h-14 rounded-full bg-[#111b21] flex items-center justify-center text-2xl mx-auto mb-3 text-[#0084ff]">
            <Phone className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium text-[#e9edef] mb-1">No call history</p>
          <p className="text-xs text-[#8696a0] max-w-xs mx-auto mb-4">
            Tap the call link button above or call any of your active anonymous contacts directly.
          </p>
          <button
            onClick={() => navigate("/new-chat")}
            className="px-4 py-2 bg-[#0084ff] hover:bg-[#0070df] text-white font-semibold rounded-full text-xs transition-colors"
          >
            Start New Call
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#202c33]/30">
          {callsList.map((call) => {
            const isCaller = call.callerAnonId === currentUser.anonId;
            const peerName = isCaller ? (call.receiverName || call.receiverAnonId) : call.callerName;
            const peerAvatar = isCaller ? (call.receiverAvatar || "👤") : call.callerAvatar;

            return (
              <CallItem
                key={call.id}
                name={peerName}
                avatar={peerAvatar}
                timestamp={call.timestamp || "Today"}
                type={call.type}
                incoming={!isCaller}
                missed={call.status === "missed"}
                onCall={() => navigate(`/call/${call.id}${call.type === "video" ? "?video=true" : ""}`)}
              />
            );
          })}
        </div>
      )}

      {/* New Call Blue FAB */}
      <button
        onClick={() => navigate("/new-chat")}
        className="fixed bottom-20 lg:bottom-6 right-5 w-14 h-14 bg-[#0084ff] hover:bg-[#0070df] text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 z-30"
        title="Start Call"
      >
        <PhoneCall className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
