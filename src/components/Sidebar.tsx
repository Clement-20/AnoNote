import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  Phone, 
  Settings as SettingsIcon, 
  Search, 
  ShieldCheck, 
  Plus, 
  MoreVertical,
  HelpCircle,
  Download
} from 'lucide-react';
import { Chat, User, StatusStory, CallRecord } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentUser: User;
  chats: Chat[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  onOpenSettings: () => void;
  onOpenStatus: () => void;
  onOpenKnowledgeBase: () => void;
  statuses: StatusStory[];
  calls: CallRecord[];
  onStartCall: (chatId: string, type: 'voice' | 'video') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  onOpenSettings,
  onOpenStatus,
  onOpenKnowledgeBase,
  statuses,
  calls,
  onStartCall
}) => {
  const [tab, setTab] = useState<'chats' | 'status' | 'calls'>('chats');
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const filteredChats = chats.filter(c => {
    const partner = c.isGroup ? c.name : c.participants.find(p => p.id !== currentUser.id)?.name;
    return partner?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <aside className="w-full md:w-[380px] lg:w-[420px] bg-[#111b21] border-r border-[#222d34] flex flex-col h-full select-none text-[#e9edef]">
      
      {/* Header */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenSettings}>
          <div className="relative">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border border-[#00a8fc]" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a8fc] border-2 border-[#202c33] rounded-full" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white truncate max-w-[130px]">{currentUser.name}</h3>
            <p className="text-[11px] font-mono text-[#00a8fc]">{currentUser.anonId}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#aebac1]">
          {/* PWA Install Button integrated in header */}
          <PWAInstallButton variant="header" />

          <button 
            onClick={onOpenStatus}
            className="p-2 hover:bg-[#374248] rounded-full transition-colors relative"
            title="Anonymous Status"
          >
            <Users className="w-5 h-5" />
            {statuses.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#00a8fc] rounded-full" />
            )}
          </button>
          <button 
            onClick={onOpenNewChat}
            className="p-2 hover:bg-[#374248] rounded-full transition-colors"
            title="New Secure Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#374248] rounded-full transition-colors"
              title="Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#233138] border border-[#222d34] rounded-xl shadow-2xl py-2 z-50 text-sm">
                <button 
                  onClick={() => { setShowMenu(false); onOpenNewChat(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] flex items-center gap-2.5"
                >
                  <Plus className="w-4 h-4 text-[#00a8fc]" />
                  New Chat / Group
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onOpenStatus(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] flex items-center gap-2.5"
                >
                  <Users className="w-4 h-4 text-[#00a8fc]" />
                  Status Stories
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onOpenKnowledgeBase(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] flex items-center gap-2.5"
                >
                  <HelpCircle className="w-4 h-4 text-[#00a8fc]" />
                  Privacy &amp; FAQ (AEO)
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onOpenSettings(); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] flex items-center gap-2.5 border-t border-[#222d34]/60 pt-2"
                >
                  <SettingsIcon className="w-4 h-4 text-[#00a8fc]" />
                  Settings &amp; Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-[#111b21] border-b border-[#222d34] px-4 py-2 gap-2">
        <button
          onClick={() => setTab('chats')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${tab === 'chats' ? 'bg-[#202c33] text-[#00a8fc]' : 'text-[#8696a0] hover:bg-[#202c33]/50'}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chats ({chats.length})
        </button>
        <button
          onClick={() => setTab('status')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${tab === 'status' ? 'bg-[#202c33] text-[#00a8fc]' : 'text-[#8696a0] hover:bg-[#202c33]/50'}`}
        >
          <Users className="w-3.5 h-3.5" />
          Status
        </button>
        <button
          onClick={() => setTab('calls')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${tab === 'calls' ? 'bg-[#202c33] text-[#00a8fc]' : 'text-[#8696a0] hover:bg-[#202c33]/50'}`}
        >
          <Phone className="w-3.5 h-3.5" />
          Calls
        </button>
      </div>

      {/* Search Bar */}
      {tab === 'chats' && (
        <div className="p-3 bg-[#111b21] border-b border-[#222d34]">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full pl-10 pr-4 py-2 bg-[#202c33] rounded-xl text-sm text-white placeholder-[#8696a0] focus:outline-none border border-transparent focus:border-[#00a8fc]/40"
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]">
        {tab === 'chats' && (
          filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <MessageSquare className="w-12 h-12 text-[#8696a0] mb-3 opacity-40" />
              <p className="text-sm text-[#8696a0]">No secure chats found</p>
              <button 
                onClick={onOpenNewChat}
                className="mt-3 px-4 py-2 bg-[#00a8fc] text-[#0b141a] font-bold rounded-xl text-xs hover:bg-[#0284c7] transition-colors"
              >
                Start Encrypted Chat
              </button>
            </div>
          ) : (
            filteredChats.map(chat => {
              const partner = chat.isGroup 
                ? { name: chat.name || 'Group', avatar: chat.avatar || '', anonId: 'Encrypted Group', online: true }
                : chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];
              
              const isActive = chat.id === activeChatId;

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/60'}`}
                >
                  <div className="relative shrink-0">
                    <img src={partner?.avatar} alt={partner?.name} className="w-12 h-12 rounded-full object-cover" />
                    {partner?.online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a8fc] border-2 border-[#111b21] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-white truncate">{partner?.name}</h4>
                      <span className="text-[11px] text-[#8696a0] shrink-0">
                        {chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#8696a0] truncate flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#00a8fc] shrink-0" />
                        <span className="truncate">{chat.lastMessage?.text || 'Encrypted chat initialized'}</span>
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-[#00a8fc] text-[#0b141a] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}

        {tab === 'status' && (
          <div className="p-4 space-y-4">
            <button
              onClick={onOpenStatus}
              className="w-full p-4 bg-[#202c33] hover:bg-[#2a3942] rounded-2xl flex items-center gap-4 transition-colors border border-[#00a8fc]/30"
            >
              <div className="w-12 h-12 rounded-full bg-[#00a8fc]/20 text-[#00a8fc] flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white">My Status Story</h4>
                <p className="text-xs text-[#8696a0]">Share encrypted updates for 24h</p>
              </div>
            </button>
            <div className="text-xs text-[#8696a0] uppercase tracking-wider font-semibold px-2">Recent Statuses ({statuses.length})</div>
            {statuses.map(st => (
              <div key={st.id} onClick={onOpenStatus} className="flex items-center gap-3 p-3 bg-[#202c33]/40 rounded-xl cursor-pointer hover:bg-[#202c33]">
                <img src={st.userAvatar} alt="user" className="w-12 h-12 rounded-full object-cover border-2 border-[#00a8fc]" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{st.userName}</h4>
                  <p className="text-xs text-[#8696a0]">{st.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'calls' && (
          <div className="p-4 space-y-3">
            <div className="text-xs text-[#8696a0] uppercase tracking-wider font-semibold px-2">Encrypted Call History</div>
            {calls.length === 0 ? (
              <p className="text-center text-xs text-[#8696a0] py-8">No recent calls</p>
            ) : (
              calls.map(call => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-[#202c33]/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={call.callerAvatar} alt="caller" className="w-11 h-11 rounded-full object-cover" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{call.callerName}</h4>
                      <p className="text-xs text-[#8696a0] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#00a8fc]" />
                        {call.direction} {call.type} call
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onStartCall(call.chatId, call.type)}
                    className="p-2.5 bg-[#00a8fc]/20 hover:bg-[#00a8fc]/30 rounded-full text-[#00a8fc] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </aside>
  );
};
