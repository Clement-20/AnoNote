import { useState, useEffect } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { ShieldCheck, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function AnonymitySettings() {
  const { currentUser, updateProfile } = useAuth();
  const [hideTyping, setHideTyping] = useState(() => localStorage.getItem("anonote_hide_typing") === "true");
  const [hideReadReceipts, setHideReadReceipts] = useState(() => localStorage.getItem("anonote_hide_read_receipts") === "true");
  const [hideOnline, setHideOnline] = useState(() => localStorage.getItem("anonote_hide_online") !== "false");
  const [anonMode, setAnonMode] = useState(() => localStorage.getItem("anonote_strict_anon") === "true");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleTyping = (val: boolean) => {
    setHideTyping(val);
    localStorage.setItem("anonote_hide_typing", val ? "true" : "false");
    showToast(val ? "Typing indicators hidden" : "Typing indicators visible");
  };

  const handleToggleReceipts = (val: boolean) => {
    setHideReadReceipts(val);
    localStorage.setItem("anonote_hide_read_receipts", val ? "true" : "false");
    showToast(val ? "Read receipts hidden" : "Read receipts enabled");
  };

  const handleToggleOnline = (val: boolean) => {
    setHideOnline(val);
    localStorage.setItem("anonote_hide_online", val ? "true" : "false");
    showToast(val ? "Online status hidden" : "Online status visible");
  };

  const handleToggleStrictAnon = (val: boolean) => {
    setAnonMode(val);
    localStorage.setItem("anonote_strict_anon", val ? "true" : "false");
    if (val) {
      setHideTyping(true);
      setHideReadReceipts(true);
      setHideOnline(true);
      localStorage.setItem("anonote_hide_typing", "true");
      localStorage.setItem("anonote_hide_read_receipts", "true");
      localStorage.setItem("anonote_hide_online", "true");
    }
    showToast(val ? "Maximum Anonymous Mode activated" : "Standard privacy mode");
  };

  return (
    <SettingsPage title="Anonymity">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0284c7] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Anon Identity */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Anon Identity</h3>
        </div>
        <SettingsOption
          title="Current Anon Handle"
          description="Your active public Anon ID"
          value={currentUser.anonId}
        />
        <SettingsOption
          title="Anon ID visibility"
          description="Who can see your Anon ID"
          value="Contacts & Direct links"
        />
      </div>

      {/* Anonymous Features */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Stealth Controls</h3>
        </div>
        <SettingsOption
          title="Hide typing indicator"
          description="Do not broadcast when you are composing messages"
          rightContent={<ToggleSwitch defaultChecked={hideTyping} onChange={handleToggleTyping} />}
        />
        <SettingsOption
          title="Hide read receipts"
          description="Do not send blue double-ticks when viewing incoming chats"
          rightContent={<ToggleSwitch defaultChecked={hideReadReceipts} onChange={handleToggleReceipts} />}
        />
        <SettingsOption
          title="Hide online presence"
          description="Keep your activity status offline to contacts"
          rightContent={<ToggleSwitch defaultChecked={hideOnline} onChange={handleToggleOnline} />}
        />
        <SettingsOption
          title="Maximum Anonymous Mode"
          description="Disable all metadata broadcasts and typing telemetry"
          rightContent={<ToggleSwitch defaultChecked={anonMode} onChange={handleToggleStrictAnon} />}
        />
      </div>

      {/* Info notice */}
      <div className="px-4 py-6">
        <div className="flex gap-3 bg-[#111b21] border border-[#202c33] rounded-md p-4">
          <ShieldCheck className="w-5 h-5 text-[#38bdf8] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#e9edef] mb-1 font-medium">AnoNote Zero-Knowledge Guarantee</p>
            <p className="text-xs text-[#8696a0] leading-relaxed">
              AnoNote protects your identity by design. Messages are decrypted only in memory on your device with no persistent server metadata.
            </p>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
