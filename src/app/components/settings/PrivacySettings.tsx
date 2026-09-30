import { useState, useEffect } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Lock, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  isBiometricsSupported,
  isBiometricsEnabled,
  enrollBiometrics,
  disableBiometrics,
} from "../../services/biometricService";

export function PrivacySettings() {
  const { currentUser } = useAuth();
  const [readReceipts, setReadReceipts] = useState(() => localStorage.getItem("anonote_read_receipts") !== "false");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(() => isBiometricsEnabled());

  useEffect(() => {
    isBiometricsSupported().then((supported) => {
      setIsSupported(supported);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleReceipts = (checked: boolean) => {
    setReadReceipts(checked);
    localStorage.setItem("anonote_read_receipts", checked ? "true" : "false");
    showToast(checked ? "Read receipts enabled" : "Read receipts disabled");
  };

  const handleToggleAppLock = async (checked: boolean) => {
    if (checked) {
      try {
        const enrolled = await enrollBiometrics(currentUser.anonId);
        if (enrolled) {
          setAppLockEnabled(true);
          showToast("Biometric App Lock activated! 🔒");
        } else {
          setAppLockEnabled(false);
        }
      } catch (err: any) {
        setAppLockEnabled(false);
        showToast(err?.message || "Verification failed");
      }
    } else {
      disableBiometrics(currentUser.anonId);
      setAppLockEnabled(false);
      showToast("App lock deactivated.");
    }
  };

  return (
    <SettingsPage title="Privacy">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0284c7] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg border border-[#38bdf8]/20">
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
          title="Biometric App Lock"
          description={
            isSupported
              ? "Require FaceID, TouchID, or Fingerprint verification to unlock and open AnoNote."
              : "Require Local Fingerprint or Face ID to open AnoNote. (Not supported on this browser/sandbox)"
          }
          rightContent={
            <ToggleSwitch
              key={String(appLockEnabled)}
              defaultChecked={appLockEnabled}
              onChange={handleToggleAppLock}
              disabled={!isSupported && !appLockEnabled}
            />
          }
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
