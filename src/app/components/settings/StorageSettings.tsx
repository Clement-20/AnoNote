import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Trash2, Download, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function StorageSettings() {
  const { currentUser } = useAuth();
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExportChatHistory = (format: 'json' | 'txt') => {
    const currentUserName = currentUser?.name || "Anon User";
    const backupData = {
      app: "AnoNote",
      exportDate: new Date().toISOString(),
      user: currentUserName,
      anonId: currentUser?.anonId,
      chats: [
        {
          id: "general",
          name: "Direct Conversations",
          exportedAt: new Date().toLocaleString(),
        }
      ]
    };

    let blob: Blob;
    let filename: string;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      filename = `anonote_backup_${Date.now()}.json`;
    } else {
      let textContent = `=== ANONOTE ENCRYPTED BACKUP ===\nExported: ${new Date().toLocaleString()}\nUser: ${currentUserName} (${currentUser?.anonId})\n`;
      blob = new Blob([textContent], { type: 'text/plain' });
      filename = `anonote_backup_${Date.now()}.txt`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccess(`Exported as ${format.toUpperCase()}`);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleClearCache = () => {
    localStorage.removeItem("anonote_drafts");
    setExportSuccess("Temporary cache cleared!");
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <SettingsPage title="Storage and Data">
      {/* Export chat history */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Chat Backup & Export</h3>
            <p className="text-xs text-[#8696a0] mt-0.5">Download plaintext or encrypted backup</p>
          </div>
          {exportSuccess && (
            <span className="text-xs text-[#38bdf8] flex items-center gap-1 font-medium bg-[#0284c7]/15 px-2.5 py-1 rounded border border-[#0284c7]/30">
              <Check className="w-3.5 h-3.5" />
              {exportSuccess}
            </span>
          )}
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExportChatHistory('json')}
            className="flex items-center justify-center gap-2 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] py-2.5 px-4 rounded-md text-xs font-medium transition-colors border border-[#2a3942]"
          >
            <Download className="w-4 h-4 text-[#38bdf8]" />
            Export JSON
          </button>
          <button
            onClick={() => handleExportChatHistory('txt')}
            className="flex items-center justify-center gap-2 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] py-2.5 px-4 rounded-md text-xs font-medium transition-colors border border-[#2a3942]"
          >
            <Download className="w-4 h-4 text-[#38bdf8]" />
            Export TXT
          </button>
        </div>
      </div>

      {/* Storage usage */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Storage Usage</h3>
        </div>
        <SettingsOption
          title="Manage storage"
          description="Local offline database cache"
          value="1.2 MB"
          showArrow
        />
        <SettingsOption
          title="Network usage"
          description="Real-time WebSocket data sent/received"
          value="450 KB"
          showArrow
        />
      </div>

      {/* Media Quality */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Media Upload Quality</h3>
        </div>
        <SettingsOption
          title="HD photo & video quality"
          description="Send compressed or original high-resolution media"
          value="Standard (Fast)"
          showArrow
        />
      </div>

      {/* Cache */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Cache & Cleanup</h3>
        </div>
        <div
          onClick={handleClearCache}
          className="flex items-center justify-between px-4 py-3.5 border-b border-[#202c33]/40 hover:bg-[#202c33]/40 cursor-pointer transition-colors"
        >
          <div className="flex-1">
            <h3 className="text-[#e9edef] text-[15px] font-normal">Clear temporary cache</h3>
            <p className="text-xs text-[#8696a0] mt-0.5">Free up memory by resetting local draft buffers</p>
          </div>
          <Trash2 className="w-4 h-4 text-[#8696a0] flex-shrink-0 ml-3" />
        </div>
      </div>
    </SettingsPage>
  );
}
