import React, { useState } from 'react';
import { X, Search, Shield, UserPlus, Users } from 'lucide-react';
import { User } from '../types';

interface NewChatModalProps {
  onClose: () => void;
  onStartChat: (targetUserId: string) => void;
  onCreateGroup: (name: string, selectedUserIds: string[]) => void;
  availableUsers: User[];
  currentUser: User;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  onClose,
  onStartChat,
  onCreateGroup,
  availableUsers,
  currentUser
}) => {
  const [tab, setTab] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [anonIdInput, setAnonIdInput] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<string[]>([]);

  const filteredUsers = availableUsers.filter(u => 
    u.id !== currentUser.id && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.anonId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = anonIdInput.trim();
    const found = availableUsers.find(u => u.anonId.toLowerCase() === cleanId.toLowerCase() || u.id === cleanId);
    if (found) {
      onStartChat(found.id);
    } else {
      alert("Anonymous user ID not found in active network nodes. Try selecting from online users below.");
    }
  };

  const handleToggleGroupUser = (id: string) => {
    if (selectedGroupUsers.includes(id)) {
      setSelectedGroupUsers(selectedGroupUsers.filter(uId => uId !== id));
    } else {
      setSelectedGroupUsers([...selectedGroupUsers, id]);
    }
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (selectedGroupUsers.length === 0) {
      alert("Please select at least one member for the group");
      return;
    }
    onCreateGroup(groupName.trim(), selectedGroupUsers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef] flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00a8fc]" />
            New Secure Conversation
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#222d34] bg-[#111b21]">
          <button
            onClick={() => setTab('direct')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${tab === 'direct' ? 'border-[#00a8fc] text-[#00a8fc]' : 'border-transparent text-[#8696a0] hover:text-white'}`}
          >
            <Shield className="w-4 h-4" />
            Direct Anonymous Chat
          </button>
          <button
            onClick={() => setTab('group')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${tab === 'group' ? 'border-[#00a8fc] text-[#00a8fc]' : 'border-transparent text-[#8696a0] hover:text-white'}`}
          >
            <Users className="w-4 h-4" />
            Create Secure Group
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {tab === 'direct' ? (
            <>
              {/* Direct by Anon ID */}
              <form onSubmit={handleDirectSubmit} className="space-y-3">
                <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider">
                  Connect via Anonymous ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={anonIdInput}
                    onChange={(e) => setAnonIdInput(e.target.value)}
                    placeholder="e.g. Anon-4821-X9"
                    className="flex-1 px-4 py-3 bg-[#2a3942] border border-transparent rounded-xl text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a8fc] text-sm font-mono"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] font-bold rounded-xl transition-colors text-sm"
                  >
                    Connect
                  </button>
                </div>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#222d34]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#111b21] px-3 text-[#8696a0]">Or select from network</span>
                </div>
              </div>

              {/* Search online users */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8696a0]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search online users or AI bots..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#2a3942] rounded-xl text-sm text-white placeholder-[#8696a0] focus:outline-none"
                  />
                </div>

                <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-sm text-[#8696a0] py-6">No online users found</p>
                  ) : (
                    filteredUsers.map(u => (
                      <div
                        key={u.id}
                        onClick={() => onStartChat(u.id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#202c33] cursor-pointer transition-colors border border-transparent hover:border-[#222d34]"
                      >
                        <div className="relative">
                          <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
                          {u.online && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a8fc] border-2 border-[#111b21] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                            {u.name}
                            {u.id.includes('ai') && (
                              <span className="bg-[#00a8fc]/20 text-[#00a8fc] text-[10px] px-1.5 py-0.5 rounded font-mono">AI</span>
                            )}
                          </h4>
                          <p className="text-xs text-[#8696a0] font-mono">{u.anonId}</p>
                          <p className="text-xs text-[#8696a0] truncate mt-0.5">{u.about}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Anonymous Syndicate 🛡️"
                  className="w-full px-4 py-3 bg-[#2a3942] border border-transparent rounded-xl text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a8fc] text-sm"
                  maxLength={40}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
                  Select Members ({selectedGroupUsers.length} selected)
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {availableUsers.filter(u => u.id !== currentUser.id).map(u => {
                    const isSelected = selectedGroupUsers.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleToggleGroupUser(u.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${isSelected ? 'bg-[#00a8fc]/15 border-[#00a8fc]/40' : 'bg-[#2a3942]/40 border-transparent hover:bg-[#2a3942]'}`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{u.name}</h4>
                          <p className="text-xs text-[#8696a0] font-mono">{u.anonId}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-[#00a8fc] border-[#00a8fc] text-[#0b141a]' : 'border-[#8696a0]'}`}>
                          {isSelected && <span className="text-xs font-bold">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] font-bold rounded-xl transition-colors text-sm shadow-lg mt-4"
              >
                Create Encrypted Group
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
