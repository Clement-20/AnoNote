import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { ShieldCheck } from "lucide-react";

export function AnonymitySettings() {
  return (
    <SettingsPage title="Anonymity">
      {/* Anon Identity */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Anon Identity</h3>
        </div>
        <SettingsOption
          title="Auto-generate Anon name"
          description="Automatically create random Anon handles"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="Change Anon avatar"
          description="Customize your anonymous avatar"
          value="🎭"
          showArrow
        />
        <SettingsOption
          title="Anon ID visibility"
          description="Who can see your Anon ID"
          value="Everyone"
          showArrow
        />
      </div>

      {/* Anonymous Features */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Anonymous Features</h3>
        </div>
        <SettingsOption
          title="Hide typing indicator"
          description="Don't show when you're typing"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
        <SettingsOption
          title="Hide read receipts"
          description="Don't show when you've read messages"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
        <SettingsOption
          title="Hide online status"
          description="Don't show when you're online"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="Anonymous mode"
          description="Maximum privacy, disable all status indicators"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
      </div>

      {/* Contact Information */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Contact Information</h3>
        </div>
        <SettingsOption
          title="Share contact info"
          description="Allow others to share your Anon ID"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="Discoverability"
          description="Let people find you by your Anon ID on anoNote"
          value="My contacts"
          showArrow
        />
      </div>

      {/* Info */}
      <div className="px-4 py-6">
        <div className="flex gap-3 bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
          <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white mb-1 font-medium">Maximum Anonymity</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              anoNote protects your identity by design. Zero logs, zero metadata, and zero personal credentials on anoNote.icepab.name.ng.
            </p>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
