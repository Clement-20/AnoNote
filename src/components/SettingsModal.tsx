import React, { useState } from 'react';
import { X, User as UserIcon, Shield, Bell, Key, Smartphone, Download, Globe } from 'lucide-react';
import { User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onClose,
  onUpdateUser,
  onLogout
}) => {
  const [name, setName] = useState(currentUser.name);
  const [about, setAbout] = useState(currentUser.about);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: name.trim() || currentUser.name,
      about: about.trim() || currentUser.about
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef] flex flex-col max-h-[85vh]">
        
        <div className="p-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#00a8fc]" />
            AnoNote Settings &amp; Profile
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Profile Header */}
          <div className="flex items-center gap-4 bg-[#2a3942]/60 p-4 rounded-xl border border-[#222d34]">
            <img src={currentUser.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#00a8fc]" />
            <div>
              <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs font-mono text-[#00a8fc]">{currentUser.anonId}</p>
              <p className="text-xs text-[#8696a0] mt-1">{currentUser.about}</p>
            </div>
          </div>

          {/* PWA Integration Card */}
          <div className="bg-[#202c33]/50 border border-[#222d34] p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Smartphone className="w-4 h-4 text-[#00a8fc]" />
                <span>Progressive Web App (PWA)</span>
              </div>
              <PWAInstallButton variant="settings" />
            </div>
            <p className="text-[11px] text-[#8696a0] leading-relaxed">
              Install AnoNote directly to your device home screen for lightning-fast launch and offline encrypted storage.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1">
                Display Alias
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a8fc] border border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1">
                About Status
              </label>
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a3942] rounded-xl text-sm text-white focus:outline-none focus:border-[#00a8fc] border border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-1">
                Cryptographic Identity Fingerprint
              </label>
              <div className="flex items-center gap-2 bg-[#2a3942] px-4 py-3 rounded-xl text-xs font-mono text-[#00a8fc]">
                <Key className="w-4 h-4 shrink-0" />
                <span className="truncate">{currentUser.publicKey}</span>
              </div>
              <p className="text-[11px] text-[#8696a0] mt-1">Generated securely on device. Never stored on remote servers.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#222d34] flex items-center justify-between">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl text-sm transition-colors"
            >
              Sign Out / Reset ID
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              {saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
