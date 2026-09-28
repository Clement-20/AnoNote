import { useState } from "react";
import { X, Image as ImageIcon, Download, Share2, ZoomIn, FileText, Link as LinkIcon, ExternalLink } from "lucide-react";

interface MediaItem {
  id: string;
  type: 'image' | 'doc' | 'link';
  url: string;
  title: string;
  timestamp: string;
  sender: string;
  size?: string;
}

interface GroupMediaGalleryProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

export function GroupMediaGallery({ groupId, groupName, onClose }: GroupMediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'links'>('media');
  const [previewImage, setPreviewImage] = useState<MediaItem | null>(null);

  // Sample and dynamic media items for this group
  const [mediaItems] = useState<MediaItem[]>([
    {
      id: "med-1",
      type: "image",
      url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
      title: "Encrypted Art Blueprint",
      timestamp: "Today, 11:20 AM",
      sender: "Anon #3847",
    },
    {
      id: "med-2",
      type: "image",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      title: "Cryptographic Key Diagram",
      timestamp: "Yesterday, 4:15 PM",
      sender: "Anon #7291",
    },
    {
      id: "med-3",
      type: "image",
      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
      title: "Cyber Security Server Rack",
      timestamp: "Yesterday, 2:05 PM",
      sender: "Anon #5612",
    },
    {
      id: "med-4",
      type: "image",
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      title: "Matrix Code Screen",
      timestamp: "Jan 24, 6:40 PM",
      sender: "Anon #9204",
    },
    {
      id: "med-5",
      type: "image",
      url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
      title: "Neon Shield Wallpaper",
      timestamp: "Jan 22, 9:12 AM",
      sender: "Anon #3847",
    },
    {
      id: "med-6",
      type: "image",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
      title: "Team Collaborative Board",
      timestamp: "Jan 20, 10:00 AM",
      sender: "Anon #4156",
    },
    {
      id: "doc-1",
      type: "doc",
      url: "#",
      title: "anoNote_Security_Whitepaper.pdf",
      timestamp: "Jan 21, 3:30 PM",
      sender: "Anon #8462",
      size: "2.4 MB",
    },
    {
      id: "doc-2",
      type: "doc",
      url: "#",
      title: "End_to_End_Encryption_Specs.pdf",
      timestamp: "Jan 19, 1:15 PM",
      sender: "Anon #3847",
      size: "1.1 MB",
    },
    {
      id: "link-1",
      type: "link",
      url: "https://anoNote.icepab.name.ng",
      title: "anoNote Web Portal (anoNote.icepab.name.ng)",
      timestamp: "Today, 10:00 AM",
      sender: "Anon #8462",
    },
    {
      id: "link-2",
      type: "link",
      url: "https://github.com",
      title: "anoNote Open Cryptography Repository",
      timestamp: "Jan 23, 8:40 PM",
      sender: "Anon #7291",
    },
  ]);

  const images = mediaItems.filter((item) => item.type === "image");
  const docs = mediaItems.filter((item) => item.type === "doc");
  const links = mediaItems.filter((item) => item.type === "link");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6">
      <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-[#18181a]">
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              Media Gallery
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{groupName} • {images.length} photos & videos</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2c2c2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-800 bg-[#161618] px-4">
          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'media'
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Media ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'docs'
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Docs ({docs.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'links'
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Links ({links.length})
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'media' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setPreviewImage(img)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-gray-800 cursor-pointer hover:border-purple-500/50 transition-all shadow-md"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                    <p className="text-xs text-white font-medium truncate">{img.title}</p>
                    <span className="text-[10px] text-gray-300">{img.sender}</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs p-1 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#2c2c2e]/40 border border-gray-800 hover:bg-[#2c2c2e] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                    <p className="text-xs text-gray-400">{doc.size} • {doc.sender} • {doc.timestamp}</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${doc.title}`)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-black/30 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-2">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#2c2c2e]/40 border border-gray-800 hover:bg-[#2c2c2e] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                      {link.title}
                    </p>
                    <p className="text-xs text-purple-400 truncate">{link.url}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Shared by {link.sender} • {link.timestamp}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-white flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800 bg-[#18181a] flex items-center justify-between text-xs text-gray-400">
          <span>End-to-End Encrypted Media Cache</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2c2c2e] hover:bg-[#3c3c3e] text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Gallery
          </button>
        </div>
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-white max-w-4xl mx-auto w-full">
            <div>
              <h4 className="font-semibold text-sm">{previewImage.title}</h4>
              <p className="text-xs text-gray-400">{previewImage.sender} • {previewImage.timestamp}</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={previewImage.url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(previewImage.url);
                  alert("Image URL copied to clipboard!");
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-gray-800"
            />
          </div>

          <div className="text-center text-xs text-gray-500 py-2">
            Click anywhere outside or the X button to return to Media Gallery
          </div>
        </div>
      )}
    </div>
  );
}
