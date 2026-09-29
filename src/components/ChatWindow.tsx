import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  CheckCheck, 
  Lock,
  Play,
  Image as ImageIcon
} from 'lucide-react';
import { Chat, Message, User } from '../types';

interface ChatWindowProps {
  chat: Chat;
  currentUser: User;
  messages: Message[];
  onSendMessage: (text: string, mediaUrl?: string, mediaType?: 'image' | 'audio' | 'file') => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onOpenSecurityBadge: () => void;
  isTyping: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  currentUser,
  messages,
  onSendMessage,
  onStartCall,
  onOpenSecurityBadge,
  isTyping
}) => {
  const [text, setText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const partner = chat.isGroup
    ? { id: 'group', name: chat.name || 'Group Chat', avatar: chat.avatar || '', anonId: 'Encrypted Group', online: true, about: 'Group security enabled' }
    : chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    setShowEmojiPicker(false);
  };

  const handleSendSampleImage = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
    ];
    const img = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    onSendMessage("Encrypted Photo Attachment 📷", img, "image");
    setShowAttachments(false);
  };

  const handleSendVoiceNote = () => {
    onSendMessage("Voice Note (0:14) 🎙️", "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg", "audio");
    setIsRecordingVoice(false);
  };

  const emojis = ['😀', '😂', '🔥', '👍', '❤️', '🔒', '🚀', '😎', '🎉', '💡'];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] text-[#e9edef] relative overflow-hidden">
      
      {/* Background wallpaper subtle pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#00a8fc_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Chat Header */}
      <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34] z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenSecurityBadge}>
          <div className="relative">
            <img src={partner?.avatar} alt={partner?.name} className="w-10 h-10 rounded-full object-cover border border-[#00a8fc]/50" />
            {partner?.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a8fc] border-2 border-[#202c33] rounded-full" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              {partner?.name}
              <ShieldCheck className="w-4 h-4 text-[#00a8fc]" title="End-to-End Encrypted" />
            </h3>
            <p className="text-[11px] font-mono text-[#8696a0]">
              {partner?.anonId} {partner?.online ? '• Online' : '• Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#aebac1]">
          <button 
            onClick={() => onStartCall('voice')}
            className="p-2.5 hover:bg-[#374248] rounded-full transition-colors text-[#00a8fc]"
            title="Secure Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onStartCall('video')}
            className="p-2.5 hover:bg-[#374248] rounded-full transition-colors text-[#00a8fc]"
            title="Secure Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button 
            onClick={onOpenSecurityBadge}
            className="p-2.5 hover:bg-[#374248] rounded-full transition-colors"
            title="Encryption Info"
          >
            <Lock className="w-5 h-5 text-[#00a8fc]" />
          </button>
        </div>
      </div>

      {/* E2EE Banner */}
      <div className="bg-[#182229] border-b border-[#222d34] px-4 py-2 text-center text-xs text-[#8696a0] flex items-center justify-center gap-2 z-10 shadow-sm">
        <Lock className="w-3.5 h-3.5 text-[#00a8fc]" />
        <span>Messages and calls are end-to-end encrypted. No one outside this chat can read or listen to them.</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 z-10">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-md relative group ${isMe ? 'bg-[#0284c7] text-[#ffffff] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'}`}
              >
                {!isMe && chat.isGroup && (
                  <p className="text-[11px] font-bold text-[#00a8fc] mb-1">{msg.senderName}</p>
                )}

                {/* Media Image */}
                {msg.mediaType === 'image' && msg.mediaUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-black/20">
                    <img src={msg.mediaUrl} alt="Attachment" className="w-full max-h-60 object-cover" />
                  </div>
                )}

                {/* Audio Voice Note */}
                {msg.mediaType === 'audio' && (
                  <div className="flex items-center gap-3 py-1 min-w-[200px]">
                    <button className="w-9 h-9 rounded-full bg-[#00a8fc] text-[#0b141a] flex items-center justify-center shadow">
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                    <div className="flex-1">
                      <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-white" />
                      </div>
                      <span className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-[#8696a0]'} mt-1 block`}>0:14 • Encrypted Voice Note</span>
                    </div>
                  </div>
                )}

                {/* Text */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>

                {/* Timestamp & Ticks */}
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-[#8696a0]'}`}>
                  {msg.isEncrypted && <Lock className="w-2.5 h-2.5" />}
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 bg-[#202c33] w-max px-4 py-2 rounded-2xl text-xs text-[#8696a0]">
            <span className="animate-pulse">Encrypted typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#202c33] border-t border-[#222d34] z-10 flex items-center gap-3 relative">
        
        {/* Attachment popover */}
        {showAttachments && (
          <div className="absolute bottom-16 left-3 bg-[#233138] border border-[#222d34] rounded-2xl p-3 shadow-2xl flex flex-col gap-2 z-30">
            <button
              onClick={handleSendSampleImage}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#111b21] text-sm text-white text-left transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-[#00a8fc]" />
              <span>Photos &amp; Images</span>
            </button>
            <button
              onClick={() => { handleSendVoiceNote(); setShowAttachments(false); }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#111b21] text-sm text-white text-left transition-colors"
            >
              <Mic className="w-4 h-4 text-[#00a8fc]" />
              <span>Voice Note</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="p-2.5 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-white transition-colors"
          title="Attach Media"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2.5 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-white transition-colors"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-12 bg-[#233138] border border-[#222d34] rounded-2xl p-3 shadow-2xl grid grid-cols-5 gap-2 z-30">
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => { setText(prev => prev + emoji); setShowEmojiPicker(false); }}
                className="w-10 h-10 hover:bg-[#111b21] rounded-xl flex items-center justify-center text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type an encrypted message..."
            className="flex-1 py-3 px-4 bg-[#2a3942] rounded-xl text-sm text-white placeholder-[#8696a0] focus:outline-none border border-transparent focus:border-[#00a8fc]/40"
          />
          {text.trim() ? (
            <button
              type="submit"
              className="p-3 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] rounded-xl transition-colors shadow-lg font-bold"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="p-3 bg-[#2a3942] hover:bg-[#374248] text-[#00a8fc] rounded-xl transition-colors"
              title="Send Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>

      </div>

    </div>
  );
};
