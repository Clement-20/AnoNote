import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Check } from "lucide-react";

export function AppearanceSettings() {
  const [selectedTheme, setSelectedTheme] = useState("dark");
  const [enterIsSend, setEnterIsSend] = useState(() => localStorage.getItem("anonote_enter_send") === "true");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const themes = [
    { id: "dark", name: "Dark (WhatsApp Minimalist)" },
    { id: "light", name: "Light Mode (Beta)" },
    { id: "auto", name: "System default" },
  ];

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    showToast(`Theme set to ${themeId}`);
  };

  const handleToggleEnter = (val: boolean) => {
    setEnterIsSend(val);
    localStorage.setItem("anonote_enter_send", val ? "true" : "false");
    showToast(val ? "Enter key sends message" : "Enter key creates new line");
  };

  return (
    <SettingsPage title="Appearance">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0284c7] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Theme */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Theme</h3>
        </div>
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleSelectTheme(theme.id)}
            className="flex items-center justify-between px-4 py-3.5 border-b border-[#202c33]/40 cursor-pointer hover:bg-[#202c33]/40 transition-colors"
          >
            <span className="text-[#e9edef] text-[15px]">{theme.name}</span>
            {selectedTheme === theme.id && (
              <Check className="w-5 h-5 text-[#38bdf8]" />
            )}
          </div>
        ))}
      </div>

      {/* Chat Settings */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Chat Settings</h3>
        </div>
        <SettingsOption
          title="Enter is send"
          description="Enter key will send your message"
          rightContent={<ToggleSwitch defaultChecked={enterIsSend} onChange={handleToggleEnter} />}
        />
        <SettingsOption
          title="Message font size"
          value="Medium"
          showArrow
        />
        <SettingsOption
          title="Show avatars in group chats"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
      </div>

      {/* Language */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Language</h3>
        </div>
        <SettingsOption
          title="App language"
          value="English (US)"
          showArrow
        />
      </div>

      {/* Message Preview */}
      <div className="px-4 py-6">
        <p className="text-xs text-[#8696a0] mb-2 font-medium">Message bubble preview</p>
        <div className="bg-[#111b21] rounded-lg p-4 border border-[#202c33] space-y-3">
          {/* Received bubble */}
          <div className="flex justify-start">
            <div className="bg-[#202c33] rounded-lg rounded-tl-none px-3.5 py-2 max-w-[80%] text-sm text-[#e9edef]">
              <p>Hey! This is how incoming messages look in AnoNote.</p>
              <div className="flex justify-end mt-1 text-[11px] text-[#8696a0]">10:42 AM</div>
            </div>
          </div>

          {/* Sent bubble */}
          <div className="flex justify-end">
            <div className="bg-[#0b4d75] rounded-lg rounded-tr-none px-3.5 py-2 max-w-[80%] text-sm text-white">
              <p>Clean, minimalist blue WhatsApp style! 🚀</p>
              <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-[#38bdf8]">
                <span>10:43 AM</span>
                <span>✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
