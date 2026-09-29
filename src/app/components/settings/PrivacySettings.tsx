import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Lock, Check } from "lucide-react";

export function PrivacySettings() {
  const [readReceipts, setReadReceipts] = useState(() => localStorage.getItem("anonote_read_receipts") !== "false");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleReceipts = (checked: boolean) => {
    setReadReceipts(checked);
    localStorage.setItem("anonote_read_receipts", checked ? "true" : "false");
    showToast(checked ? "Read receipts enabled" : "Read receipts disabled");
  };

  return (
    <SettingsPage title="Privacy">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0284c7] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Visibility */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">
            Who can see my personal info
          </h3>
        </div>
        <SettingsOption
          title="Last seen & online"
          value="Nobody"
          showArrow
        />
        <SettingsOption
          title="Profile photo"
          value="Contacts"
          showArrow
        />
        <SettingsOption
          title="About"
          value="Everyone"
          showArrow
        />
        <SettingsOption
          title="Status"
          value="My contacts"
          showArrow
        />
      </div>

      {/* Disappearing Messages & Receipts */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Messaging</h3>
        </div>
        <SettingsOption
          title="Read receipts"
          description="If turned off, you won't send or receive read receipts. Read receipts are always sent for group chats."
          rightContent={<ToggleSwitch defaultChecked={readReceipts} onChange={handleToggleReceipts} />}
        />
        <SettingsOption
          title="Default message timer"
          description="Start new chats with disappearing messages set to"
          value="Off"
          showArrow
        />
      </div>

      {/* Advanced */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Security & Locking</h3>
        </div>
        <SettingsOption
          title="Blocked contacts"
          value="0"
          showArrow
        />
        <SettingsOption
          title="App lock"
          description="Require authentication to open AnoNote"
          rightContent={<ToggleSwitch defaultChecked={false} />}
        />
      </div>

      {/* Notice */}
      <div className="px-4 py-6">
        <div className="flex gap-3 bg-[#111b21] border border-[#202c33] rounded-md p-4">
          <Lock className="w-5 h-5 text-[#38bdf8] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#e9edef] mb-1 font-medium">End-to-End Encryption</p>
            <p className="text-xs text-[#8696a0] leading-relaxed">
              All private messages and group conversations on AnoNote are end-to-end encrypted. No third parties can intercept or read them.
            </p>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
