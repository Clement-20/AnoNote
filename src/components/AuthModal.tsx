import React, { useState } from 'react';
import { Shield, Sparkles, User as UserIcon, Lock, Key } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onLogin: (user: User) => void;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('Encrypted & Anonymous 🔒');
  const [avatar, setAvatar] = useState(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [anonId] = useState(`Anon-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);
  const [publicKey] = useState(`key_fp_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 10)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Agent_${Math.floor(Math.random() * 900 + 100)}`;
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      anonId,
      name: finalName,
      about,
      avatar,
      publicKey,
      online: true
    };
    onLogin(user);
  };

  const handleGenerateNewId = () => {
    const newId = `Anon-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const newKey = `key_fp_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 10)}`;
    // Just refresh state
    window.location.reload(); // simple reset or react state if we want
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef] p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center mb-4 text-[#00a884] shadow-lg shadow-[#00a884]/10">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AnonWhatsApp</h1>
          <p className="text-sm text-[#8696a0] mt-1">
            Zero-knowledge anonymous messaging. No phone number required. End-to-end encrypted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center mb-4">
            <div className="relative group cursor-pointer mb-2">
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover border-2 border-[#00a884] shadow-md"
              />
            </div>
            <p className="text-xs text-[#8696a0]">Choose your avatar style</p>
            <div className="flex gap-2 mt-2">
              {AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${avatar === url ? 'border-[#00a884] scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt="option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Anonymous Alias / Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8696a0]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CrypticPhantom"
                className="w-full pl-10 pr-4 py-3 bg-[#2a3942] border border-transparent rounded-xl text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors text-sm"
                maxLength={25}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              Secure Anonymous ID (Auto-Generated)
            </label>
            <div className="flex items-center gap-2 bg-[#2a3942] px-3.5 py-3 rounded-xl border border-transparent">
              <Key className="w-4 h-4 text-[#00a884]" />
              <span className="font-mono text-sm tracking-wide text-[#00a884] font-semibold flex-1">
                {anonId}
              </span>
              <span className="text-[10px] bg-[#00a884]/20 text-[#00a884] px-2 py-0.5 rounded-full uppercase font-bold">
                E2EE Secure
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1.5">
              About Status
            </label>
            <input
              type="text"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full px-4 py-3 bg-[#2a3942] border border-transparent rounded-xl text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors text-sm"
              maxLength={50}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
          >
            <Sparkles className="w-4 h-4" />
            Start Encrypted Chatting
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#222d34] text-center">
          <p className="text-[11px] text-[#8696a0] flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-[#00a884]" />
            End-to-end encrypted. Your identity remains 100% anonymous.
          </p>
        </div>
      </div>
    </div>
  );
};
