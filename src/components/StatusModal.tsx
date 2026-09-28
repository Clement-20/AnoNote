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
            <Sparkles className="w-5 h-5 text-[#00a884]" />
            Anonymous Status Stories
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#374248] rounded-full text-[#8696a0] hover:text-white">
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
                    placeholder="Add a caption..."
                    className="w-full bg-transparent text-white placeholder-gray-300 text-sm focus:outline-none"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {SAMPLE_STATUS_IMAGES.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${selectedImage === img ? 'border-[#00a884]' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 bg-[#2a3942] hover:bg-[#374248] text-white font-semibold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold rounded-xl text-sm"
              >
                Share Status
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Story list */}
            <div className="w-full md:w-1/3 border-r border-[#222d34] p-4 overflow-y-auto space-y-3">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-xl flex items-center gap-3 transition-colors border border-[#00a884]/30"
              >
                <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white">Add Status</h4>
                  <p className="text-xs text-[#8696a0]">Share update for 24h</p>
                </div>
              </button>

              <div className="space-y-2 mt-2">
                {statuses.map(st => (
                  <div
                    key={st.id}
                    onClick={() => setActiveStory(st)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${activeStory?.id === st.id ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                  >
                    <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#00a884] to-[#005c4b]">
                      <img src={st.userAvatar} alt={st.userName} className="w-full h-full rounded-full object-cover border-2 border-[#111b21]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{st.userName}</h4>
                      <p className="text-xs text-[#8696a0] truncate">{st.caption || 'Status update'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Story Viewer */}
            <div className="flex-1 bg-[#0b141a] flex flex-col items-center justify-center p-6 relative">
              {activeStory ? (
                <div className="w-full max-w-sm h-[400px] rounded-2xl overflow-hidden relative border border-[#222d34] shadow-2xl">
                  <img src={activeStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 right-4 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2.5 rounded-xl">
                    <img src={activeStory.userAvatar} alt="user" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-semibold text-white">{activeStory.userName}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl">
                    <p className="text-xs text-white text-center">{activeStory.caption}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#8696a0]">Select a status story to view</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
