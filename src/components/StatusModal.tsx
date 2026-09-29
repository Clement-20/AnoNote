import React, { useState } from 'react';
import { X, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { StatusStory, User } from '../types';

interface StatusModalProps {
  currentUser: User;
  statuses: StatusStory[];
  onClose: () => void;
  onAddStatus: (mediaUrl: string, caption: string) => void;
}

const SAMPLE_STATUS_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80"
];

export const StatusModal: React.FC<StatusModalProps> = ({
  currentUser,
  statuses,
  onClose,
  onAddStatus
}) => {
  const [activeStory, setActiveStory] = useState<StatusStory | null>(statuses[0] || null);
  const [isCreating, setIsCreating] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState(SAMPLE_STATUS_IMAGES[0]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStatus(selectedImage, caption.trim() || 'Encrypted Status update 🔒');
    setIsCreating(false);
    setCaption('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl overflow-hidden text-[#e9edef] flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00a8fc]" />
            Anonymous Status Stories
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCreating ? (
          <form onSubmit={handleCreate} className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#8696a0] uppercase">Post New Anonymous Status</h3>
              <div className="relative h-64 rounded-2xl overflow-hidden border border-[#222d34]">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add an encrypted caption..."
                    className="w-full px-4 py-2.5 bg-[#202c33]/90 rounded-xl text-sm text-white placeholder-[#8696a0] focus:outline-none border border-transparent focus:border-[#00a8fc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8696a0] uppercase tracking-wider mb-2">
                  Select Visual Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_STATUS_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-[#00a8fc] scale-102' : 'border-transparent opacity-60'}`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 bg-[#2a3942] hover:bg-[#374248] text-white font-medium rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] font-bold rounded-xl text-sm transition-colors"
              >
                Share Story (24h)
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {activeStory ? (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={activeStory.userAvatar} alt="user" className="w-10 h-10 rounded-full object-cover border-2 border-[#00a8fc]" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{activeStory.userName}</h4>
                      <p className="text-[11px] text-[#8696a0]">{new Date(activeStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 24h Ephemeral</p>
                    </div>
                  </div>
                  <div className="relative h-72 rounded-2xl overflow-hidden border border-[#222d34] shadow-xl">
                    <img src={activeStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      <p className="text-sm font-medium text-white">{activeStory.caption}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto py-2">
                  {statuses.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setActiveStory(st)}
                      className={`h-12 w-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeStory?.id === st.id ? 'border-[#00a8fc] scale-105' : 'border-transparent opacity-60'}`}
                    >
                      <img src={st.mediaUrl} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    onClick={() => setIsCreating(true)}
                    className="h-12 w-12 rounded-xl bg-[#202c33] border border-dashed border-[#00a8fc]/50 hover:border-[#00a8fc] text-[#00a8fc] flex items-center justify-center shrink-0 transition-colors"
                    title="Add new story"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Sparkles className="w-12 h-12 text-[#8696a0] mb-3 opacity-30" />
                <p className="text-sm text-[#8696a0] mb-4">No active status stories</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-5 py-2.5 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] font-bold rounded-xl text-xs transition-colors"
                >
                  Create Story
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
