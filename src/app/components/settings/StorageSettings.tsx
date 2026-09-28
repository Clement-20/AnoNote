import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Database, Trash2, Download, Check } from "lucide-react";

export function StorageSettings() {
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExportChatHistory = (format: 'json' | 'txt') => {
    const currentUserName = localStorage.getItem("ghost_note_account_name") || "Anon #8462";
    const backupData = {
      app: "anoNote (anoNote.icepab.name.ng)",
      exportDate: new Date().toISOString(),
      user: currentUserName,
      chats: [
        {
          id: "1",
          name: "Anon #3847",
          messages: [
            { id: "m1", text: "Hey! How are you doing?", sender: "Anon #3847", timestamp: "2:30 PM" },
            { id: "m2", text: "I'm doing great! Thanks for asking 😊", sender: currentUserName, timestamp: "2:32 PM" }
          ]
        },
        {
          id: "2",
          name: "Anon #7291",
          messages: [
            { id: "m1", text: "Did you see the news today?", sender: currentUserName, timestamp: "1:15 PM" },
            { id: "m2", text: "Thanks for sharing that", sender: "Anon #7291", timestamp: "1:32 PM" }
          ]
        }
      ]
    };

    let blob: Blob;
    let filename: string;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      filename = `anonote_backup_${Date.now()}.json`;
    } else {
      let textContent = `=== ANONOTE CHAT BACKUP (anoNote.icepab.name.ng) ===\nExported: ${new Date().toLocaleString()}\nUser: ${currentUserName}\n\n`;
      backupData.chats.forEach(chat => {
        textContent += `--- Chat: ${chat.name} ---\n`;
        chat.messages.forEach(m => {
          textContent += `[${m.timestamp}] ${m.sender}: ${m.text}\n`;
        });
        textContent += `\n`;
      });
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

    setExportSuccess(`Successfully exported as ${format.toUpperCase()}`);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  return (
    <SettingsPage title="Storage and Data">
      {/* Export chat history */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm text-gray-400 uppercase tracking-wide">Chat History Export</h3>
            <p className="text-xs text-gray-500 mt-0.5">Export chats for personal secure backups</p>
          </div>
          {exportSuccess && (
            <span className="text-xs text-green-400 flex items-center gap-1 font-medium bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
              <Check className="w-3.5 h-3.5" />
              {exportSuccess}
            </span>
          )}
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExportChatHistory('json')}
            className="flex items-center justify-center gap-2 bg-[#2c2c2e] hover:bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors border border-gray-800"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export as JSON
          </button>
          <button
            onClick={() => handleExportChatHistory('txt')}
            className="flex items-center justify-center gap-2 bg-[#2c2c2e] hover:bg-purple-600 text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors border border-gray-800"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export as Text
          </button>
        </div>
      </div>

      {/* Storage usage */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Storage Usage</h3>
        </div>
        <SettingsOption
          title="Manage storage"
          description="2.4 GB"
          showArrow
        />
      </div>

      {/* Network usage */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Network Usage</h3>
        </div>
        <SettingsOption
          title="Network usage"
          description="View data usage statistics"
          showArrow
        />
      </div>

      {/* Media auto-download */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">
            Media Auto-Download
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Voice messages are always automatically downloaded
          </p>
        </div>
        <SettingsOption
          title="When using mobile data"
          value="Photos"
          showArrow
        />
        <SettingsOption
          title="When connected on Wi-Fi"
          value="All media"
          showArrow
        />
        <SettingsOption
          title="When roaming"
          value="No media"
          showArrow
        />
      </div>

      {/* Media quality */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Media Quality</h3>
        </div>
        <SettingsOption
          title="Photo upload quality"
          value="Auto (recommended)"
          showArrow
        />
        <SettingsOption
          title="Best quality for photos"
          description="Use less compression"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
      </div>

      {/* Backup */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Backup</h3>
        </div>
        <SettingsOption
          title="Chat backup"
          description="Last backup: Never"
          showArrow
        />
        <SettingsOption
          title="Auto backup"
          value="Off"
          showArrow
        />
        <SettingsOption
          title="Include videos"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
      </div>

      {/* Cache */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Cache</h3>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 hover:bg-[#2c2c2e] cursor-pointer transition-colors">
          <div className="flex-1">
            <h3 className="text-white font-medium">Clear cache</h3>
            <p className="text-sm text-gray-400 mt-0.5">Free up space by clearing temporary files</p>
          </div>
          <Trash2 className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3" />
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-6">
        <div className="flex gap-3 bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
          <Database className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white mb-1 font-medium">Storage Tip</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Regularly manage your storage to keep anoNote running smoothly.
              Consider backing up important media to the cloud.
            </p>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
