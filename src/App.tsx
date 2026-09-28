import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { NewChatModal } from './components/NewChatModal';
import { SettingsModal } from './components/SettingsModal';
import { StatusModal } from './components/StatusModal';
import { SecurityBadgeModal } from './components/SecurityBadgeModal';
import { CallModal } from './components/CallModal';
import { User, Chat, Message, StatusStory, CallRecord } from './types';
import { ShieldCheck, Lock, MessageSquare } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('anon_whatsapp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);

  // Modals state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  
  // Call state
  const [activeCall, setActiveCall] = useState<{
    partner: User;
    type: 'voice' | 'video';
    isIncoming: boolean;
    chatId: string;
  } | null>(null);

  // Typing indicators
  const [typingMap, setTypingMap] = useState<{ [chatId: string]: boolean }>({});

  // Statuses & Calls history
  const [statuses, setStatuses] = useState<StatusStory[]>([
    {
      id: 'st_1',
      userId: 'ai-bot-01',
      userName: 'Encrypted Cipher AI',
      userAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      caption: 'Securing the anonymous network 🔒',
      timestamp: Date.now() - 3600000,
      viewed: false
    }
  ]);
  const [callsHistory, setCallsHistory] = useState<CallRecord[]>([]);

  // Initialize Socket.IO connection when user logs in
  useEffect(() => {
    if (!currentUser) return;

    localStorage.setItem('anon_whatsapp_user', JSON.stringify(currentUser));

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      newSocket.emit('register_user', currentUser);
    });

    newSocket.on('init_data', (data: { users: User[]; chats: Chat[]; messages: { [key: string]: Message[] } }) => {
      setAvailableUsers(data.users);
      setChats(data.chats);
      setMessages(data.messages);
      if (data.chats.length > 0 && !activeChatId) {
        setActiveChatId(data.chats[0].id);
      }
    });

    newSocket.on('new_message', (msg: Message) => {
      setMessages(prev => {
        const list = prev[msg.chatId] || [];
        if (list.some(m => m.id === msg.id)) return prev;
        return {
          ...prev,
          [msg.chatId]: [...list, msg]
        };
      });

      setChats(prev => prev.map(c => {
        if (c.id === msg.chatId) {
          return {
            ...c,
            lastMessage: msg,
            unreadCount: c.id === activeChatId ? 0 : c.unreadCount + 1
          };
        }
        return c;
      }));
    });

    newSocket.on('chat_created', (newChat: Chat) => {
      setChats(prev => {
        if (prev.some(c => c.id === newChat.id)) return prev;
        return [newChat, ...prev];
      });
      setActiveChatId(newChat.id);
      setIsNewChatOpen(false);
    });

    newSocket.on('user_status_changed', (data: { userId: string; online: boolean }) => {
      setAvailableUsers(prev => prev.map(u => u.id === data.userId ? { ...u, online: data.online } : u));
      setChats(prev => prev.map(c => ({
        ...c,
        participants: c.participants.map(p => p.id === data.userId ? { ...p, online: data.online } : p)
      })));
    });

    newSocket.on('typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUser.id) {
        setTypingMap(prev => ({ ...prev, [data.chatId]: data.isTyping }));
      }
    });

    newSocket.on('incoming_call', (data: { caller: User; type: 'voice' | 'video'; chatId: string }) => {
      setActiveCall({
        partner: data.caller,
        type: data.type,
        isIncoming: true,
        chatId: data.chatId
      });
    });

    newSocket.on('call_answered', (data: { accept: boolean }) => {
      if (!data.accept) {
        setActiveCall(null);
        alert("Call was declined.");
      }
    });

    newSocket.on('call_ended', () => {
      setActiveCall(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('anon_whatsapp_user');
    setCurrentUser(null);
    if (socket) socket.disconnect();
  };

  const handleSendMessage = (text: string, mediaUrl?: string, mediaType?: 'image' | 'audio' | 'file') => {
    if (!activeChatId || !currentUser || !socket) return;

    const msg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: Date.now(),
      status: 'sent',
      mediaUrl,
      mediaType,
      isEncrypted: true
    };

    socket.emit('send_message', msg);
  };

  const handleStartChat = (targetUserId: string) => {
    if (!socket || !currentUser) return;
    socket.emit('create_direct_chat', { targetUserId, currentUser });
  };

  const handleCreateGroup = (name: string, selectedUserIds: string[]) => {
    if (!socket || !currentUser) return;
    const participants = availableUsers.filter(u => selectedUserIds.includes(u.id));
    socket.emit('create_group', { name, participants, creator: currentUser });
  };

  const handleStartCall = (chatId: string, type: 'voice' | 'video') => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || !currentUser || !socket) return;
    const partner = chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];

    setActiveCall({
      partner,
      type,
      isIncoming: false,
      chatId
    });

    socket.emit('call_user', {
      targetUserId: partner.id,
      caller: currentUser,
      type,
      chatId
    });

    // Add to calls history
    setCallsHistory(prev => [
      {
        id: `call_${Date.now()}`,
        chatId,
        callerId: partner.id,
        callerName: partner.name,
        callerAvatar: partner.avatar,
        type,
        direction: 'outgoing',
        timestamp: Date.now()
      },
      ...prev
    ]);
  };

  const handleAddStatus = (mediaUrl: string, caption: string) => {
    if (!currentUser) return;
    const newSt: StatusStory = {
      id: `st_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      mediaUrl,
      caption,
      timestamp: Date.now(),
      viewed: false
    };
    setStatuses([newSt, ...statuses]);
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeChatMessages = activeChatId ? (messages[activeChatId] || []) : [];
  const activePartner = activeChat && currentUser
    ? (activeChat.isGroup ? undefined : activeChat.participants.find(p => p.id !== currentUser.id))
    : undefined;

  if (!currentUser) {
    return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#0b141a] overflow-hidden font-sans">
      
      {/* WhatsApp desktop background stripe */}
      <div className="absolute top-0 inset-x-0 h-32 bg-[#00a884] pointer-events-none hidden md:block" />

      <div className="w-full max-w-7xl mx-auto h-full md:h-[calc(100vh-3rem)] md:my-auto md:rounded-xl shadow-2xl flex overflow-hidden border border-[#222d34] z-10">
        
        {/* Sidebar */}
        <Sidebar
          currentUser={currentUser}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setChats(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
          }}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStatus={() => setIsStatusOpen(true)}
          statuses={statuses}
          calls={callsHistory}
          onStartCall={(chatId, type) => handleStartCall(chatId, type)}
        />

        {/* Chat Window or Welcome Screen */}
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            currentUser={currentUser}
            messages={activeChatMessages}
            onSendMessage={handleSendMessage}
            onStartCall={(type) => handleStartCall(activeChat.id, type)}
            onOpenSecurityBadge={() => setIsSecurityOpen(true)}
            isTyping={!!typingMap[activeChat.id]}
          />
        ) : (
          <div className="flex-1 bg-[#222d34]/40 flex flex-col items-center justify-center text-center p-8 text-[#e9edef]">
            <div className="w-20 h-20 rounded-3xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] mb-6 shadow-xl">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-light tracking-tight mb-2">AnonWhatsApp Web</h2>
            <p className="text-sm text-[#8696a0] max-w-sm leading-relaxed mb-6">
              Send and receive end-to-end encrypted messages without linking phone numbers. Your identity is 100% anonymous.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#00a884] bg-[#00a884]/10 px-4 py-2 rounded-full border border-[#00a884]/30">
              <Lock className="w-3.5 h-3.5" />
              <span>End-to-End Encrypted Protocol Active</span>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {isNewChatOpen && (
        <NewChatModal
          onClose={() => setIsNewChatOpen(false)}
          onStartChat={handleStartChat}
          onCreateGroup={handleCreateGroup}
          availableUsers={availableUsers}
          currentUser={currentUser}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          currentUser={currentUser}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onLogout={handleLogout}
        />
      )}

      {isStatusOpen && (
        <StatusModal
          currentUser={currentUser}
          statuses={statuses}
          onClose={() => setIsStatusOpen(false)}
          onAddStatus={handleAddStatus}
        />
      )}

      {isSecurityOpen && (
        <SecurityBadgeModal
          currentUser={currentUser}
          chatPartner={activePartner}
          onClose={() => setIsSecurityOpen(false)}
        />
      )}

      {activeCall && (
        <CallModal
          partner={activeCall.partner}
          type={activeCall.type}
          isIncoming={activeCall.isIncoming}
          onReject={() => {
            if (socket) socket.emit('answer_call', { targetUserId: activeCall.partner.id, accept: false });
            setActiveCall(null);
          }}
          onAccept={() => {
            if (socket) socket.emit('answer_call', { targetUserId: activeCall.partner.id, accept: true });
          }}
          onEndCall={() => {
            if (socket) socket.emit('end_call', { targetUserId: activeCall.partner.id });
            setActiveCall(null);
          }}
        />
      )}

    </div>
  );
}
