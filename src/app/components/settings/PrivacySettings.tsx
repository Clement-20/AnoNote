import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Lock } from "lucide-react";

export function PrivacySettings() {
  return (
    <SettingsPage title="Privacy">
      {/* Who can see my personal info */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">
            Who can see my personal info
          </h3>
        </div>
        <SettingsOption
          title="Last seen & online"
          description="Who can see when you're online"
          value="Nobody"
          showArrow
        />
        <SettingsOption
          title="Profile photo"
          description="Who can see your profile photo"
          value="My contacts"
          showArrow
        />
        <SettingsOption
          title="About"
          description="Who can see your about info"
          value="Everyone"
          showArrow
        />
        <SettingsOption
          title="Status"
          description="Who can see your status updates"
          value="My contacts"
          showArrow
        />
      </div>

      {/* Messaging */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Messaging</h3>
        </div>
        <SettingsOption
          title="Read receipts"
          description="If turned off, you won't send or receive read receipts"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="Disappearing messages"
          description="Default timer for new chats"
          value="Off"
          showArrow
        />
      </div>

      {/* Groups */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Groups</h3>
        </div>
        <SettingsOption
          title="Groups"
          description="Who can add you to groups"
          value="Everyone"
          showArrow
        />
      </div>

      {/* Advanced */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Advanced</h3>
        </div>
        <SettingsOption
          title="Blocked contacts"
          description="0 contacts"
          showArrow
        />
        <SettingsOption
          title="Fingerprint lock"
          description="Lock anoNote with fingerprint or biometrics"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
        <SettingsOption
          title="App lock timeout"
          description="Require authentication after"
          value="1 minute"
          showArrow
        />
      </div>

      {/* Info */}
      <div className="px-4 py-6">
        <div className="flex gap-3 bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
          <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white mb-1 font-medium">End-to-end Encryption</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              All your messages are protected with end-to-end encryption. Only you
              and your contact can read them.
            </p>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
