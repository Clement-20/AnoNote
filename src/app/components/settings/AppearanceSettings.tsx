import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Check } from "lucide-react";

export function AppearanceSettings() {
  const themes = [
    { id: "dark", name: "Dark", selected: true },
    { id: "light", name: "Light", selected: false },
    { id: "auto", name: "System default", selected: false },
  ];

  return (
    <SettingsPage title="Appearance">
      {/* Theme */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Theme</h3>
        </div>
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="flex items-center justify-between px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-[#2c2c2e] transition-colors"
          >
            <span className="text-white">{theme.name}</span>
            {theme.selected && (
              <Check className="w-5 h-5 text-purple-400" />
            )}
          </div>
        ))}
      </div>

      {/* Wallpaper */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Wallpaper</h3>
        </div>
        <SettingsOption
          title="Change wallpaper"
          description="Set a custom background for chats"
          showArrow
        />
        <SettingsOption
          title="Solid color"
          description="Use a solid color background"
          showArrow
        />
        <SettingsOption
          title="Wallpaper brightness"
          value="Default"
          showArrow
        />
      </div>

      {/* Chat settings */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Chat Settings</h3>
        </div>
        <SettingsOption
          title="Enter is send"
          description="Enter key sends messages"
          rightContent={<ToggleSwitch defaultChecked={false} />}
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
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Language</h3>
        </div>
        <SettingsOption
          title="App language"
          value="English"
          showArrow
        />
      </div>

      {/* Accessibility */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Accessibility</h3>
        </div>
        <SettingsOption
          title="Reduce motion"
          description="Minimize animations"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
        <SettingsOption
          title="High contrast mode"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
      </div>

      {/* Preview */}
      <div className="px-4 py-6">
        <div className="bg-[#1c1c1e] rounded-lg p-4 border border-gray-800">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-lg flex-shrink-0">
              👻
            </div>
            <div className="flex-1">
              <div className="bg-[#2c2c2e] rounded-2xl rounded-tl-sm px-4 py-2 mb-1">
                <p className="text-white text-sm">This is how messages will look</p>
              </div>
              <span className="text-xs text-gray-500 px-1">2:45 PM</span>
            </div>
          </div>
          <div className="flex items-start gap-3 justify-end">
            <div className="flex-1 flex justify-end">
              <div>
                <div className="bg-purple-600 rounded-2xl rounded-br-sm px-4 py-2 mb-1">
                  <p className="text-white text-sm">Preview of sent messages</p>
                </div>
                <span className="text-xs text-gray-500 px-1 flex justify-end">2:46 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
