import { useState } from "react";
import { X, Image as ImageIcon, Download, Share2, ZoomIn, FileText, Link as LinkIcon, ExternalLink, Check } from "lucide-react";

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
  const [copiedLink, setCopiedLink] = useState(false);

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
      id: "doc-1",
      type: "doc",
      url: "#",
      title: "AnoNote_Security_Whitepaper.pdf",
      timestamp: "Jan 21, 3:30 PM",
      sender: "Anon #8462",
      size: "2.4 MB",
    },
    {
      id: "link-1",
      type: "link",
      url: "https://anonote.me",
      title: "AnoNote Official Portal",
      timestamp: "Today, 10:00 AM",
      sender: "Anon #8462",
    },
  ]);

  const images = mediaItems.filter((item) => item.type === "image");
  const docs = mediaItems.filter((item) => item.type === "doc");
  const links = mediaItems.filter((item) => item.type === "link");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#111b21] border border-[#202c33] rounded-lg w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#202c33] flex items-center justify-between bg-[#111b21]">
          <div>
            <h3 className="text-[#e9edef] font-medium text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#38bdf8]" />
              Media Gallery
            </h3>
            <p className="text-xs text-[#8696a0] mt-0.5">{groupName} • {images.length} items</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8696a0] hover:text-[#e9edef] p-1.5 rounded-full hover:bg-[#202c33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-[#202c33] bg-[#111b21] px-4">
          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'media'
                ? "border-[#0284c7] text-[#38bdf8]"
                : "border-transparent text-[#8696a0] hover:text-[#e9edef]"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Media ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? "border-[#0284c7] text-[#38bdf8]"
                : "border-transparent text-[#8696a0] hover:text-[#e9edef]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Docs ({docs.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'links'
                ? "border-[#0284c7] text-[#38bdf8]"
                : "border-transparent text-[#8696a0] hover:text-[#e9edef]"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Links ({links.length})
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'media' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setPreviewImage(img)}
                  className="group relative aspect-square rounded-md overflow-hidden bg-[#202c33] border border-[#202c33] cursor-pointer hover:border-[#0284c7] transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                    <p className="text-xs text-white truncate font-medium">{img.title}</p>
                    <span className="text-[10px] text-[#8696a0]">{img.sender}</span>
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
                  className="flex items-center gap-3 p-3 rounded-md bg-[#202c33] border border-[#2a3942]"
                >
                  <div className="w-9 h-9 rounded bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#e9edef] truncate">{doc.title}</p>
                    <p className="text-[11px] text-[#8696a0]">{doc.size} • {doc.sender} • {doc.timestamp}</p>
                  </div>
                  <button
                    onClick={() => {}}
                    className="p-1.5 text-[#8696a0] hover:text-[#e9edef] rounded hover:bg-[#111b21] transition-colors"
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
                  className="flex items-center gap-3 p-3 rounded-md bg-[#202c33] border border-[#2a3942] hover:bg-[#2a3942] transition-colors"
                >
                  <div className="w-9 h-9 rounded bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center flex-shrink-0">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#e9edef] truncate">{link.title}</p>
                    <p className="text-[11px] text-[#38bdf8] truncate">{link.url}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#8696a0] flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#202c33] bg-[#0b141a] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-[#e9edef] max-w-4xl mx-auto w-full">
            <div>
              <h4 className="font-medium text-sm">{previewImage.title}</h4>
              <p className="text-xs text-[#8696a0]">{previewImage.sender} • {previewImage.timestamp}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[75vh] max-w-full object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
